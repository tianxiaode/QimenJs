/**
 * EventBus emit 增强 + deepNullify 单元测试
 *
 * 测试覆盖：
 * 1. emit 引用计数（_refCount）
 * 2. 异步 handler 支持
 * 3. cleanupContext 显式清理
 * 4. 错误处理
 * 5. deepNullify 工具函数
 * 6. scopeId 隔离
 */

import { EventBus } from '@/events/EventBus';
import { shallowNullify } from '@/utils/object/properties';
import { EventContextBuilder } from '@/context';

describe('EventBus emit 增强', () => {
    let bus: EventBus;

    beforeEach(() => {
        bus = new EventBus();
    });

    test('引用计数：同步 handler 完成后归零', () => {
        const scope = bus.createScope();
        const handler = jest.fn();
        scope.on('test:count', handler);

        scope.emit(
            'test:count',
            EventContextBuilder.create()
                .withEvent('test:count')
                .withData({ items: [1, 2, 3], name: 'test' })
                .build()
        );

        expect(handler).toHaveBeenCalledTimes(1);

        const ctx = handler.mock.calls[0][0];
        // _refCount 归零
        expect(ctx._refCount).toBe(0);
        // data 不自动清理
        expect(ctx.data.items).toEqual([1, 2, 3]);
        expect(ctx.data.name).toBe('test');
    });

    test('引用计数：多个 handler 逐一递减', () => {
        const scope = bus.createScope();
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const handler3 = jest.fn();

        scope.on('test:multi', handler1);
        scope.on('test:multi', handler2);
        scope.on('test:multi', handler3);

        scope.emit(
            'test:multi',
            EventContextBuilder.create().withEvent('test:multi').withData({ value: 1 }).build()
        );

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
        expect(handler3).toHaveBeenCalledTimes(1);

        const ctx = handler1.mock.calls[0][0];
        expect(ctx._refCount).toBe(0);
    });

    test('异步 handler：Promise 完成后递减引用计数', async () => {
        const scope = bus.createScope();
        let resolvePromise: () => void;
        const promise = new Promise<void>(resolve => {
            resolvePromise = resolve;
        });

        let capturedCtx: any;
        const handler = jest.fn((ctx: any) => {
            capturedCtx = ctx;
            return promise;
        });
        scope.on('test:async', handler);

        scope.emit(
            'test:async',
            EventContextBuilder.create().withEvent('test:async').withData({ value: 1 }).build()
        );

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
        const scope = bus.createScope();
        let resolveAsync: () => void;
        const asyncPromise = new Promise<void>(resolve => {
            resolveAsync = resolve;
        });

        const syncHandler = jest.fn();
        const asyncHandler = jest.fn(() => asyncPromise);

        scope.on('test:mixed', syncHandler);
        scope.on('test:mixed', asyncHandler);

        scope.emit(
            'test:mixed',
            EventContextBuilder.create()
                .withEvent('test:mixed')
                .withData({ items: [1, 2] })
                .build()
        );

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
        const scope = bus.createScope();
        const handler2 = jest.fn();
        scope.on('test:error', () => {
            throw new Error('handler1 error');
        });
        scope.on('test:error', handler2);

        expect(() => {
            scope.emit(
                'test:error',
                EventContextBuilder.create().withEvent('test:error').withData({ value: 1 }).build()
            );
        }).not.toThrow();

        expect(handler2).toHaveBeenCalledTimes(1);
        const ctx = handler2.mock.calls[0][0];
        expect(ctx._refCount).toBe(0);
    });

    test('错误处理：异步 handler reject 不中断其他 handler', async () => {
        const scope = bus.createScope();
        const handler2 = jest.fn();
        scope.on('test:asyncError', () => {
            return Promise.reject(new Error('async error'));
        });
        scope.on('test:asyncError', handler2);

        scope.emit(
            'test:asyncError',
            EventContextBuilder.create().withEvent('test:asyncError').withData({ value: 1 }).build()
        );

        expect(handler2).toHaveBeenCalledTimes(1);

        await new Promise(resolve => setTimeout(resolve, 10));

        const ctx = handler2.mock.calls[0][0];
        expect(ctx._refCount).toBe(0);
    });

    test('无监听器时不报错', () => {
        const scope = bus.createScope();
        expect(() => {
            scope.emit(
                'test:noListeners',
                EventContextBuilder.create().withEvent('test:noListeners').withData({}).build()
            );
        }).not.toThrow();
    });

    test('cleanupContext：显式清理 data', () => {
        const scope = bus.createScope();
        const handler = jest.fn();
        scope.on('test:cleanup', handler);

        scope.emit(
            'test:cleanup',
            EventContextBuilder.create()
                .withEvent('test:cleanup')
                .withData({ items: [1, 2, 3], name: 'test' })
                .build()
        );

        const ctx = handler.mock.calls[0][0];
        // data 未被自动清理
        expect(ctx.data.items).toEqual([1, 2, 3]);

        // 显式清理
        bus.cleanupContext(ctx);
        expect(ctx.data.items).toEqual([]);
        expect(ctx.data.name).toBe('test');
    });

    test('scopeId 隔离：emit 只触发自己 scope 下的 handler', () => {
        const scope1 = bus.createScope();
        const scope2 = bus.createScope();
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        scope1.on('test:isolate', handler1);
        scope2.on('test:isolate', handler2);

        scope1.emit(
            'test:isolate',
            EventContextBuilder.create()
                .withEvent('test:isolate')
                .withData({ data: 'from-scope1' })
                .build()
        );

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).not.toHaveBeenCalled();
    });

    test('scopeId 隔离：不同 scope 互不干扰', () => {
        const scope1 = bus.createScope();
        const scope2 = bus.createScope();
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        scope1.on('click', handler1);
        scope2.on('click', handler2);

        scope1.emit('click', EventContextBuilder.create().withEvent('click').withData({}).build());
        scope2.emit('click', EventContextBuilder.create().withEvent('click').withData({}).build());

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
    });
});

describe('shallowNullify', () => {
    test('清理对象中的嵌套对象', () => {
        const obj = { items: [1, 2, 3], name: 'test', nested: { a: 1 } };
        shallowNullify(obj);

        expect(obj.items).toEqual([]);
        expect(obj.name).toBe('test');
        expect(obj.nested).toEqual({});
    });

    test('清理数组', () => {
        const arr = [1, 2, 3];
        shallowNullify(arr);
        expect(arr).toEqual([]);
    });

    test('不处理原始值', () => {
        const obj = { count: 5, flag: true, text: 'hello' };
        shallowNullify(obj);
        expect(obj.count).toBe(5);
        expect(obj.flag).toBe(true);
        expect(obj.text).toBe('hello');
    });

    test('null 和 undefined 不报错', () => {
        expect(() => shallowNullify(null)).not.toThrow();
        expect(() => shallowNullify(undefined)).not.toThrow();
    });

    test('原始类型不报错', () => {
        expect(() => shallowNullify(42)).not.toThrow();
        expect(() => shallowNullify('string')).not.toThrow();
        expect(() => shallowNullify(true)).not.toThrow();
    });

    test('混合结构', () => {
        const obj = {
            list: [{ id: 1 }, { id: 2 }],
            config: { debug: true },
            count: 10,
            name: 'test',
        };
        shallowNullify(obj);

        expect(obj.list).toEqual([]);
        expect(obj.config).toEqual({});
        expect(obj.count).toBe(10);
        expect(obj.name).toBe('test');
    });
});
