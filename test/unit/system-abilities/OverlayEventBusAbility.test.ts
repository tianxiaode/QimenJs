/**
 * OverlayEventBusAbility 单元测试
 *
 * 覆盖：overlayEmit、overlayOn、overlayOnce
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

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { OverlayEventBusAbility } from '@/system-abilities/system/OverlayEventBusAbility';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { EventContextBuilder } from '@/context';

function createHost() {
    class TestHost extends ComposableBase {}
    withAbilities(TestHost, [OverlayEventBusAbility]);
    return new TestHost() as any;
}

describe('OverlayEventBusAbility', () => {
    beforeEach(() => {
        (OverlayEventBus as any).instance = undefined;
    });

    describe('overlayEmit', () => {
        it('发送浮层事件', () => {
            const host = createHost();
            const ctx = EventContextBuilder.create()
                .withEvent('overlay:dropdown:show')
                .withType('show')
                .withSource('dropdown')
                .withData({})
                .build();
            expect(() => host.overlayEmit(ctx)).not.toThrow();
        });
    });

    describe('overlayOn', () => {
        it('监听浮层事件返回 off 函数', () => {
            const host = createHost();
            const handler = jest.fn();
            const off = host.overlayOn('dropdown', 'shown', handler);
            expect(typeof off).toBe('function');
        });

        it('监听后接收事件', () => {
            const host = createHost();
            const handler = jest.fn();
            host.overlayOn('dropdown', 'shown', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('overlay:dropdown:shown')
                .withType('shown')
                .withSource('dropdown')
                .withData({ visible: true })
                .build();
            host.overlayEmit(ctx);
            expect(handler).toHaveBeenCalled();
        });
    });

    describe('overlayOnce', () => {
        it('一次性监听', () => {
            const host = createHost();
            const handler = jest.fn();
            host.overlayOnce('dropdown', 'shown', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('overlay:dropdown:shown')
                .withType('shown')
                .withSource('dropdown')
                .withData({})
                .build();
            host.overlayEmit(ctx);
            host.overlayEmit(ctx);
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
