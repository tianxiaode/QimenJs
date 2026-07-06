/**
 * EventBus emit 增强 + deepNullify 单元测试
 *
 * 测试覆盖：
 * 1. emit 引用计数（_refCount）
 * 2. 异步 handler 支持
 * 3. cleanupContext 显式清理
 * 4. 错误处理
 * 5. deepNullify 工具函数
 * 6. 向后兼容性
 */

import { EventBus, deepNullify } from '@/events/EventBus';

describe('EventBus emit 增强', () => {
    let bus: EventBus;

    beforeEach(() => {
        bus = new EventBus();
    });

    test('引用计数：同步 handler 完成后归零', () => {
        const handler = jest.fn();
        bus.on('test:count', handler);

        bus.emit('test:count', { items: [1, 2, 3], name: 'test' });

        expect(handler).toHaveBeenCalledTimes(1);

        const ctx = handler.mock.calls[0][0];
        // _refCount 归零
        expect(ctx._refCount).toBe(0);
        // data 不自动清理
        expect(ctx.data.items).toEqual([1, 2, 3]);
        expect(ctx.data.name).toBe('test');
    });

    test('引用计数：多个 handler 逐一递减', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const handler3 = jest.fn();

        bus.on('test:multi', handler1);
        bus.on('test:multi', handler2);
        bus.on('test:multi', handler3);

        bus.emit('test:multi', { value: 1 });

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
        expect(handler3).toHaveBeenCalledTimes(1);

        const ctx = handler1.mock.calls[0][0];
        expect(ctx._refCount).toBe(0);
    });

    test('异步 handler：Promise 完成后递减引用计数', async () => {
        let resolvePromise: () => void;
        const promise = new Promise<void>(resolve => { resolvePromise = resolve; });

        let capturedCtx: any;
        const handler = jest.fn((ctx: any) => {
            capturedCtx = ctx;
            return promise;
        });
        bus.on('test:async', handler);

        bus.emit('test:async', { value: 1 });

        // 异步 handler 未完成，_refCount 仍为 1
        expect(capturedCtx._refCount).toBe(1);

        // 完成 Promise
        resolvePromise!();
        await promise;
        await Promise.resolve();

        // _refCount 归零
        expect(capturedCtx._refCount).toBe(0);
    });

    test('混合同步和异步 handler', async () => {
        let resolveAsync: () => void;
        const asyncPromise = new Promise<void>(resolve => { resolveAsync = resolve; });

        const syncHandler = jest.fn();
        const asyncHandler = jest.fn(() => asyncPromise);

        bus.on('test:mixed', syncHandler);
        bus.on('test:mixed', asyncHandler);

        bus.emit('test:mixed', { items: [1, 2] });

        // 同步 handler 完成，异步未完成
        const ctx = syncHandler.mock.calls[0][0];
        expect(ctx._refCount).toBe(1);
        // data 未被清理
        expect(ctx.data.items).toEqual([1, 2]);

        // 完成异步 handler
        resolveAsync!();
        await asyncPromise;
        await Promise.resolve();

        expect(ctx._refCount).toBe(0);
    });

    test('错误处理：同步 handler 抛错不中断其他 handler', () => {
        const handler2 = jest.fn();
        bus.on('test:error', () => { throw new Error('handler1 error'); });
        bus.on('test:error', handler2);

        expect(() => {
            bus.emit('test:error', { value: 1 });
        }).not.toThrow();

        expect(handler2).toHaveBeenCalledTimes(1);
        const ctx = handler2.mock.calls[0][0];
        expect(ctx._refCount).toBe(0);
    });

    test('错误处理：异步 handler reject 不中断其他 handler', async () => {
        const handler2 = jest.fn();
        bus.on('test:asyncError', () => { return Promise.reject(new Error('async error')); });
        bus.on('test:asyncError', handler2);

        bus.emit('test:asyncError', { value: 1 });

        expect(handler2).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setTimeout(resolve, 10));

        const ctx = handler2.mock.calls[0][0];
        expect(ctx._refCount).toBe(0);
    });

    test('无监听器时不报错', () => {
        expect(() => {
            bus.emit('test:noListeners', {});
        }).not.toThrow();
    });

    test('cleanupContext：显式清理 data', () => {
        const handler = jest.fn();
        bus.on('test:cleanup', handler);

        bus.emit('test:cleanup', { items: [1, 2, 3], name: 'test' });

        const ctx = handler.mock.calls[0][0];
        // data 未被自动清理
        expect(ctx.data.items).toEqual([1, 2, 3]);

        // 显式清理
        bus.cleanupContext(ctx);
        expect(ctx.data.items).toEqual([]);
        expect(ctx.data.name).toBe('test');
    });

    test('向后兼容：原有 emit 行为不变', () => {
        const handler = jest.fn();
        bus.on('legacy:event', handler);

        bus.emit('legacy:event', { data: 'test' });

        expect(handler).toHaveBeenCalledTimes(1);
        const ctx = handler.mock.calls[0][0];
        expect(ctx.event).toBe('legacy:event');
        expect(ctx.data).toEqual({ data: 'test' });
        expect(ctx.source).toBe('UNKNOWN');
        expect(ctx.timestamp).toBeDefined();
        expect(ctx.busId).toBe(bus.getBusId());
        expect(ctx.scopeId).toBe('NO_SCOPE');
    });

    test('向后兼容：source 参数正常传递', () => {
        const handler = jest.fn();
        bus.on('source:event', handler);

        const testSource = { name: 'TestSource' };
        bus.emit('source:event', { data: 'test' }, testSource);

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                source: testSource,
            })
        );
    });

    test('向后兼容：scopeId 参数正常传递', () => {
        const handler = jest.fn();
        bus.on('scope:event', handler);

        bus.emit('scope:event', { data: 'test' }, 'source', 'my-scope');

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                scopeId: 'my-scope',
            })
        );
    });
});

describe('deepNullify', () => {
    test('清理对象中的嵌套对象', () => {
        const obj = { items: [1, 2, 3], name: 'test', nested: { a: 1 } };
        deepNullify(obj);

        expect(obj.items).toEqual([]);
        expect(obj.name).toBe('test');
        expect(obj.nested).toEqual({});
    });

    test('清理数组', () => {
        const arr = [1, 2, 3];
        deepNullify(arr);
        expect(arr).toEqual([]);
    });

    test('不处理原始值', () => {
        const obj = { count: 5, flag: true, text: 'hello' };
        deepNullify(obj);
        expect(obj.count).toBe(5);
        expect(obj.flag).toBe(true);
        expect(obj.text).toBe('hello');
    });

    test('null 和 undefined 不报错', () => {
        expect(() => deepNullify(null)).not.toThrow();
        expect(() => deepNullify(undefined)).not.toThrow();
    });

    test('原始类型不报错', () => {
        expect(() => deepNullify(42)).not.toThrow();
        expect(() => deepNullify('string')).not.toThrow();
        expect(() => deepNullify(true)).not.toThrow();
    });

    test('混合结构', () => {
        const obj = {
            list: [{ id: 1 }, { id: 2 }],
            config: { debug: true },
            count: 10,
            name: 'test',
        };
        deepNullify(obj);

        expect(obj.list).toEqual([]);
        expect(obj.config).toEqual({});
        expect(obj.count).toBe(10);
        expect(obj.name).toBe('test');
    });
});
