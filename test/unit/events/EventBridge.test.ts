/**
 * EventBridge 单元测试
 *
 * 覆盖：单例模式、bridgeEmit/bridgeOn/bridgeOnce 事件收发、
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

import { EventBridge } from '@/events/EventBridge';
import { EventContextBuilder } from '@/context';

describe('EventBridge', () => {
    beforeEach(() => {
        // 每次测试前重置单例，确保测试隔离
        (EventBridge as any).instance = undefined;
    });

    afterEach(() => {
        // 清理单例
        const instance = (EventBridge as any).instance as EventBridge | undefined;
        if (instance) {
            instance.dispose();
        }
        (EventBridge as any).instance = undefined;
    });

    // ============================================
    // 单例模式
    // ============================================

    describe('单例模式', () => {
        it('getInstance 返回同一实例', () => {
            const a = EventBridge.getInstance();
            const b = EventBridge.getInstance();
            expect(a).toBe(b);
        });

        it('不同时间调用 getInstance 返回同一实例', () => {
            const a = EventBridge.getInstance();
            const b = EventBridge.getInstance();
            expect(a).toBe(b);
        });
    });

    // ============================================
    // scopeId
    // ============================================

    describe('getScopeId', () => {
        it('返回非空字符串', () => {
            const bridge = EventBridge.getInstance();
            const scopeId = bridge.getScopeId();
            expect(typeof scopeId).toBe('string');
            expect(scopeId.length).toBeGreaterThan(0);
        });
    });

    // ============================================
    // bridgeEmit / bridgeOn
    // ============================================

    describe('bridgeEmit / bridgeOn', () => {
        it('发送和监听同一 sourceId + eventName 的事件', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('myGrid', 'selectionchange', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:myGrid:selectionchange')
                    .withType('selectionchange')
                    .withSource('myGrid')
                    .withData({ selected: [1, 2] })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ selected: [1, 2] });
        });

        it('不同 sourceId 的事件互不干扰', () => {
            const bridge = EventBridge.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bridge.bridgeOn('grid1', 'change', handler1);
            bridge.bridgeOn('grid2', 'change', handler2);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:grid1:change')
                    .withType('change')
                    .withSource('grid1')
                    .withData({ data: 'a' })
                    .build()
            );

            expect(handler1).toHaveBeenCalledWith({ data: 'a' });
            expect(handler2).not.toHaveBeenCalled();
        });

        it('相同 sourceId 不同 eventName 互不干扰', () => {
            const bridge = EventBridge.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bridge.bridgeOn('myGrid', 'selectionchange', handler1);
            bridge.bridgeOn('myGrid', 'pagechange', handler2);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:myGrid:selectionchange')
                    .withType('selectionchange')
                    .withSource('myGrid')
                    .withData({ page: 1 })
                    .build()
            );

            expect(handler1).toHaveBeenCalledWith({ page: 1 });
            expect(handler2).not.toHaveBeenCalled();
        });

        it('bridgeOn 返回 off 函数，调用后不再接收事件', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            const off = bridge.bridgeOn('myGrid', 'change', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:myGrid:change')
                    .withType('change')
                    .withSource('myGrid')
                    .withData({ a: 1 })
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);

            off();

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:myGrid:change')
                    .withType('change')
                    .withSource('myGrid')
                    .withData({ a: 2 })
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1); // 仍然是1
        });

        it('多个监听器独立工作', () => {
            const bridge = EventBridge.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            bridge.bridgeOn('src', 'click', handler1);
            bridge.bridgeOn('src', 'click', handler2);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        it('off 一个监听器不影响其他监听器', () => {
            const bridge = EventBridge.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            const off1 = bridge.bridgeOn('src', 'click', handler1);
            bridge.bridgeOn('src', 'click', handler2);

            off1();

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            expect(handler1).toHaveBeenCalledTimes(0);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        it('无 data 时 bridgeEmit 不报错', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('src', 'click', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('事件名编码规则 — 内部使用 bridge:sourceId:eventName', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('router', 'change', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:router:change')
                    .withType('change')
                    .withSource('router')
                    .withData({ path: '/home' })
                    .build()
            );
            expect(handler).toHaveBeenCalledWith({ path: '/home' });
        });
    });

    // ============================================
    // bridgeOnce
    // ============================================

    describe('bridgeOnce', () => {
        it('只触发一次后自动取消', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();

            bridge.bridgeOnce('src', 'click', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({ a: 1 })
                    .build()
            );
            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({ a: 2 })
                    .build()
            );

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ a: 1 });
        });

        it('bridgeOnce 不影响 bridgeOn 监听器', () => {
            const bridge = EventBridge.getInstance();
            const onceHandler = jest.fn();
            const onHandler = jest.fn();

            bridge.bridgeOnce('src', 'click', onceHandler);
            bridge.bridgeOn('src', 'click', onHandler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );
            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
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
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('src', 'click', handler);

            bridge.dispose();

            // dispose 后重新获取单例（因为旧实例已销毁）
            (EventBridge as any).instance = undefined;
            const newBridge = EventBridge.getInstance();
            const newHandler = jest.fn();
            newBridge.bridgeOn('src', 'click', newHandler);

            newBridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData({})
                    .build()
            );

            // 旧 handler 不应被调用
            expect(handler).toHaveBeenCalledTimes(0);
            expect(newHandler).toHaveBeenCalledTimes(1);

            newBridge.dispose();
        });
    });

    // ============================================
    // 边界情况
    // ============================================

    describe('边界情况', () => {
        it('sourceId 包含特殊字符', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('my-grid_v2', 'change', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:my-grid_v2:change')
                    .withType('change')
                    .withSource('my-grid_v2')
                    .withData({ ok: true })
                    .build()
            );
            expect(handler).toHaveBeenCalledWith({ ok: true });
        });

        it('eventName 包含冒号（如 click:save）', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('src', 'click:save', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click:save')
                    .withType('click:save')
                    .withSource('src')
                    .withData({})
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('data 为 null', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('src', 'click', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData(null)
                    .build()
            );
            expect(handler).toHaveBeenCalledWith(null);
        });

        it('data 为 undefined', () => {
            const bridge = EventBridge.getInstance();
            const handler = jest.fn();
            bridge.bridgeOn('src', 'click', handler);

            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent('bridge:src:click')
                    .withType('click')
                    .withSource('src')
                    .withData(undefined)
                    .build()
            );
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
