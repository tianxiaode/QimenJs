/**
 * ComponentEventBus 单元测试
 *
 * 覆盖：单例模式、componentEmit/componentOn/componentOnce 事件收发、
 *       事件名编码规则、dispose、scopeId 统一性
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { ComponentEventBus } from '@/events/ComponentEventBus';
import { EventContextBuilder } from '@/context';

describe('ComponentEventBus', () => {
    beforeEach(() => {
        // 每次测试前重置单例，确保测试隔离
        (ComponentEventBus as any).instance = undefined;
    });

    afterEach(() => {
        // 清理单例
        const instance = (ComponentEventBus as any).instance as ComponentEventBus | undefined;
        if (instance) {
            instance.dispose();
        }
        (ComponentEventBus as any).instance = undefined;
    });

    // ============================================
    // 单例模式
    // ============================================

    describe('单例模式', () => {
        it('getInstance 返回同一实例', () => {
            const a = ComponentEventBus.getInstance();
            const b = ComponentEventBus.getInstance();
            expect(a).toBe(b);
        });

        it('不同时间调用 getInstance 返回同一实例', () => {
            const a = ComponentEventBus.getInstance();
            const b = ComponentEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    // ============================================
    // scopeId
    // ============================================

    describe('getScopeId', () => {
        it('返回非空字符串', () => {
            const bus = ComponentEventBus.getInstance();
            const scopeId = bus.getScopeId();
            expect(typeof scopeId).toBe('string');
            expect(scopeId.length).toBeGreaterThan(0);
        });
    });

    // ============================================
    // componentEmit / componentOn
    // ============================================

    describe('componentEmit / componentOn', () => {
        it('发送和监听同一 sourceId + eventName 的事件', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('myGrid', 'selectionchange', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:myGrid:selectionchange')
                    .withType('selectionchange')
                    .withSource('myGrid')
                    .withData({ selected: [1, 2] })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ selected: [1, 2] });
        });

        it('不同 sourceId 的事件互不干扰', () => {
            const bus = ComponentEventBus.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bus.componentOn('grid1', 'change', handler1);
            bus.componentOn('grid2', 'change', handler2);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:grid1:change')
                    .withType('change')
                    .withSource('grid1')
                    .withData({ data: 'a' })
                    .build()
            );

            expect(handler1).toHaveBeenCalledWith({ data: 'a' });
            expect(handler2).not.toHaveBeenCalled();
        });

        it('相同 sourceId 不同 eventName 互不干扰', () => {
            const bus = ComponentEventBus.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bus.componentOn('myGrid', 'selectionchange', handler1);
            bus.componentOn('myGrid', 'pagechange', handler2);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:myGrid:selectionchange')
                    .withType('selectionchange')
                    .withSource('myGrid')
                    .withData({ page: 1 })
                    .build()
            );

            expect(handler1).toHaveBeenCalledWith({ page: 1 });
            expect(handler2).not.toHaveBeenCalled();
        });

        it('componentOn 返回 off 函数，调用后不再接收事件', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            const off = bus.componentOn('myGrid', 'change', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:myGrid:change')
                    .withType('change')
                    .withSource('myGrid')
                    .withData({ a: 1 })
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);

            off();

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:myGrid:change')
                    .withType('change')
                    .withSource('myGrid')
                    .withData({ a: 2 })
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1); // 仍然是1
        });

        it('多个监听器独立工作', () => {
            const bus = ComponentEventBus.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bus.componentOn('src', 'click', handler1);
            bus.componentOn('src', 'click', handler2);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        it('off 一个监听器不影响其他监听器', () => {
            const bus = ComponentEventBus.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            const off1 = bus.componentOn('src', 'click', handler1);
            bus.componentOn('src', 'click', handler2);

            off1();

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(0);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        it('无 data 时 componentEmit 不报错', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('src', 'click', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('事件名编码规则 — 内部使用 component:sourceId:eventName', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('router', 'change', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:router:change')
                    .withType('change')
                    .withSource('router')
                    .withData({ path: '/home' })
                    .build()
            );
            expect(handler).toHaveBeenCalledWith({ path: '/home' });
        });
    });

    // ============================================
    // componentOnce
    // ============================================

    describe('componentOnce', () => {
        it('只触发一次后自动取消', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();

            bus.componentOnce('src', 'click', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({ a: 1 })
                    .build()
            );
            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({ a: 2 })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ a: 1 });
        });

        it('componentOnce 不影响 componentOn 监听器', () => {
            const bus = ComponentEventBus.getInstance();
            const onceHandler = jest.fn();
            const onHandler = jest.fn();

            bus.componentOnce('src', 'click', onceHandler);
            bus.componentOn('src', 'click', onHandler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );
            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            expect(onceHandler).toHaveBeenCalledTimes(1);
            expect(onHandler).toHaveBeenCalledTimes(2);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后不再接收事件', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('src', 'click', handler);

            bus.dispose();

            // dispose 后重新获取单例（因为旧实例已销毁）
            (ComponentEventBus as any).instance = undefined;
            const newBus = ComponentEventBus.getInstance();
            const newHandler = jest.fn();
            newBus.componentOn('src', 'click', newHandler);

            newBus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            // 旧 handler 不应被调用
            expect(handler).toHaveBeenCalledTimes(0);
            expect(newHandler).toHaveBeenCalledTimes(1);

            newBus.dispose();
        });
    });

    // ============================================
    // 边界情况
    // ============================================

    describe('边界情况', () => {
        it('sourceId 包含特殊字符', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('my-grid_v2', 'change', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:my-grid_v2:change')
                    .withType('change')
                    .withSource('my-grid_v2')
                    .withData({ ok: true })
                    .build()
            );
            expect(handler).toHaveBeenCalledWith({ ok: true });
        });

        it('eventName 包含冒号（如 click:save）', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('src', 'click:save', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click:save')
                    .withType('click:save')
                    .withSource('src')
                    .withData({})
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('data 为 null', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('src', 'click', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData(null)
                    .build()
            );
            expect(handler).toHaveBeenCalledWith(null);
        });

        it('data 为 undefined', () => {
            const bus = ComponentEventBus.getInstance();
            const handler = jest.fn();
            bus.componentOn('src', 'click', handler);

            bus.componentEmit(
                EventContextBuilder.create()
                    .withEvent('component:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData(undefined)
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});