/**
 * ComponentEventBusAbility（系统能力）单元测试
 *
 * 覆盖：componentEmit/componentOn/componentOnce 方法委托到 ComponentEventBus 单例、
 *       componentOn 自动注册 onCleanup
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

import { ComponentEventBusAbility } from '@/system-abilities/system/ComponentEventBusAbility';
import { ComponentEventBus } from '@/events/ComponentEventBus';
import { EventContextBuilder } from '@/context/EventContextBuilder';

describe('ComponentEventBusAbility (system)', () => {
    beforeEach(() => {
        // 重置单例
        (ComponentEventBus as any).instance = undefined;
    });

    afterEach(() => {
        const instance = (ComponentEventBus as any).instance as ComponentEventBus | undefined;
        if (instance) {
            instance.dispose();
        }
        (ComponentEventBus as any).instance = undefined;
    });

    // ============================================
    // AbilityDefinition 结构
    // ============================================

    describe('AbilityDefinition 结构', () => {
        it('是有效的 AbilityDefinition 对象', () => {
            expect(ComponentEventBusAbility).toBeDefined();
            expect(typeof ComponentEventBusAbility).toBe('object');
            expect(typeof ComponentEventBusAbility.componentEmit).toBe('function');
            expect(typeof ComponentEventBusAbility.componentOn).toBe('function');
            expect(typeof ComponentEventBusAbility.componentOnce).toBe('function');
        });
    });

    // ============================================
    // componentEmit
    // ============================================

    describe('componentEmit', () => {
        it('委托到 ComponentEventBus 单例的 componentEmit', () => {
            const bridge = ComponentEventBus.getInstance();
            const emitSpy = jest.spyOn(bridge, 'componentEmit');

            const ctx = EventContextBuilder.create()
                .withEvent('click')
                .withType('click')
                .withSource('src1')
                .withData({ data: 1 })
                .build();
            ComponentEventBusAbility.componentEmit(ctx);

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
    // componentOn
    // ============================================

    describe('componentOn', () => {
        it('委托到 ComponentEventBus 单例的 componentOn', () => {
            const bridge = ComponentEventBus.getInstance();
            const onSpy = jest.spyOn(bridge, 'componentOn');

            const mockThis = { onCleanup: jest.fn() } as any;
            const handler = jest.fn();
            const off = ComponentEventBusAbility.componentOn.call(mockThis, 'src1', 'click', handler);

            expect(onSpy).toHaveBeenCalledWith('src1', 'click', handler);
            expect(typeof off).toBe('function');
            onSpy.mockRestore();
        });

        it('自动注册 onCleanup', () => {
            const mockThis = { onCleanup: jest.fn() } as any;
            const handler = jest.fn();

            ComponentEventBusAbility.componentOn.call(mockThis, 'src1', 'click', handler);

            expect(mockThis.onCleanup).toHaveBeenCalledTimes(1);
            expect(mockThis.onCleanup).toHaveBeenCalledWith(expect.any(Function));
        });

        it('onCleanup 注册的 off 函数与返回的 off 是同一个', () => {
            const mockThis = { onCleanup: jest.fn() } as any;
            const handler = jest.fn();

            const off = ComponentEventBusAbility.componentOn.call(mockThis, 'src1', 'click', handler);

            const cleanupOff = mockThis.onCleanup.mock.calls[0][0];
            expect(cleanupOff).toBe(off);
        });
    });

    // ============================================
    // componentOnce
    // ============================================

    describe('componentOnce', () => {
        it('委托到 ComponentEventBus 单例的 componentOnce', () => {
            const bridge = ComponentEventBus.getInstance();
            const onceSpy = jest.spyOn(bridge, 'componentOnce');

            const handler = jest.fn();
            ComponentEventBusAbility.componentOnce('src1', 'click', handler);

            expect(onceSpy).toHaveBeenCalledWith('src1', 'click', handler);
            onceSpy.mockRestore();
        });
    });

    // ============================================
    // 集成：componentEmit + componentOn 实际收发
    // ============================================

    describe('集成测试', () => {
        it('componentEmit 发出的事件 componentOn 能收到', () => {
            const handler = jest.fn();
            const mockThis = { onCleanup: jest.fn() } as any;

            ComponentEventBusAbility.componentOn.call(mockThis, 'myGrid', 'change', handler);
            const ctx = EventContextBuilder.create()
                .withEvent('change')
                .withType('change')
                .withSource('myGrid')
                .withData({ page: 2 })
                .build();
            ComponentEventBusAbility.componentEmit(ctx);

            expect(handler).toHaveBeenCalledWith({ page: 2 });
        });
    });
});
