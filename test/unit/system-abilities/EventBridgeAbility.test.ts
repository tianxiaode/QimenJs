/**
 * EventBridgeAbility（系统能力）单元测试
 *
 * 覆盖：bridgeEmit/bridgeOn/bridgeOnce 方法委托到 EventBridge 单例、
 *       bridgeOn 自动注册 onCleanup
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

import { EventBridgeAbility } from '@/system-abilities/system/EventBridgeAbility';
import { EventBridge } from '@/events/EventBridge';
import { EventContextBuilder } from '@/context/EventContextBuilder';

describe('EventBridgeAbility (system)', () => {
    beforeEach(() => {
        // 重置单例
        (EventBridge as any).instance = undefined;
    });

    afterEach(() => {
        const instance = (EventBridge as any).instance as EventBridge | undefined;
        if (instance) {
            instance.dispose();
        }
        (EventBridge as any).instance = undefined;
    });

    // ============================================
    // AbilityDefinition 结构
    // ============================================

    describe('AbilityDefinition 结构', () => {
        it('是有效的 AbilityDefinition 对象', () => {
            expect(EventBridgeAbility).toBeDefined();
            expect(typeof EventBridgeAbility).toBe('object');
            expect(typeof EventBridgeAbility.bridgeEmit).toBe('function');
            expect(typeof EventBridgeAbility.bridgeOn).toBe('function');
            expect(typeof EventBridgeAbility.bridgeOnce).toBe('function');
        });
    });

    // ============================================
    // bridgeEmit
    // ============================================

    describe('bridgeEmit', () => {
        it('委托到 EventBridge 单例的 bridgeEmit', () => {
            const bridge = EventBridge.getInstance();
            const emitSpy = jest.spyOn(bridge, 'bridgeEmit');

            const ctx = EventContextBuilder.create()
                .withEvent('click')
                .withType('click')
                .withSource('src1')
                .withData({ data: 1 })
                .build();
            EventBridgeAbility.bridgeEmit(ctx);

            expect(emitSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: 'src1',
                    type: 'click',
                    data: { data: 1 },
                })
            );
            emitSpy.mockRestore();
        });
    });

    // ============================================
    // bridgeOn
    // ============================================

    describe('bridgeOn', () => {
        it('委托到 EventBridge 单例的 bridgeOn', () => {
            const bridge = EventBridge.getInstance();
            const onSpy = jest.spyOn(bridge, 'bridgeOn');

            const mockThis = { onCleanup: jest.fn() } as any;
            const handler = jest.fn();
            const off = EventBridgeAbility.bridgeOn.call(mockThis, 'src1', 'click', handler);

            expect(onSpy).toHaveBeenCalledWith('src1', 'click', handler);
            expect(typeof off).toBe('function');
            onSpy.mockRestore();
        });

        it('自动注册 onCleanup', () => {
            const mockThis = { onCleanup: jest.fn() } as any;
            const handler = jest.fn();

            EventBridgeAbility.bridgeOn.call(mockThis, 'src1', 'click', handler);

            expect(mockThis.onCleanup).toHaveBeenCalledTimes(1);
            expect(mockThis.onCleanup).toHaveBeenCalledWith(expect.any(Function));
        });

        it('onCleanup 注册的 off 函数与返回的 off 是同一个', () => {
            const mockThis = { onCleanup: jest.fn() } as any;
            const handler = jest.fn();

            const off = EventBridgeAbility.bridgeOn.call(mockThis, 'src1', 'click', handler);

            const cleanupOff = mockThis.onCleanup.mock.calls[0][0];
            expect(cleanupOff).toBe(off);
        });
    });

    // ============================================
    // bridgeOnce
    // ============================================

    describe('bridgeOnce', () => {
        it('委托到 EventBridge 单例的 bridgeOnce', () => {
            const bridge = EventBridge.getInstance();
            const onceSpy = jest.spyOn(bridge, 'bridgeOnce');

            const handler = jest.fn();
            EventBridgeAbility.bridgeOnce('src1', 'click', handler);

            expect(onceSpy).toHaveBeenCalledWith('src1', 'click', handler);
            onceSpy.mockRestore();
        });
    });

    // ============================================
    // 集成：bridgeEmit + bridgeOn 实际收发
    // ============================================

    describe('集成测试', () => {
        it('bridgeEmit 发出的事件 bridgeOn 能收到', () => {
            const handler = jest.fn();
            const mockThis = { onCleanup: jest.fn() } as any;

            EventBridgeAbility.bridgeOn.call(mockThis, 'myGrid', 'change', handler);
            const ctx = EventContextBuilder.create()
                .withEvent('change')
                .withType('change')
                .withSource('myGrid')
                .withData({ page: 2 })
                .build();
            EventBridgeAbility.bridgeEmit(ctx);

            expect(handler).toHaveBeenCalledWith({ page: 2 });
        });
    });
});
