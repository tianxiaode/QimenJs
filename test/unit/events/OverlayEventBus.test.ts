/**
 * OverlayEventBus 单元测试
 *
 * 覆盖：getInstance、getScopeId、overlayEmit、overlayOn、overlayOnce、dispose
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

import { OverlayEventBus } from '@/events/OverlayEventBus';
import { EventContextBuilder } from '@/context';

describe('OverlayEventBus', () => {
    beforeEach(() => {
        (OverlayEventBus as any).instance = undefined;
    });

    describe('getInstance', () => {
        it('返回单例', () => {
            const a = OverlayEventBus.getInstance();
            const b = OverlayEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('getScopeId', () => {
        it('返回 scopeId 字符串', () => {
            const bus = OverlayEventBus.getInstance();
            expect(typeof bus.getScopeId()).toBe('string');
        });
    });

    describe('overlayEmit / overlayOn', () => {
        it('发送和接收浮层事件', () => {
            const bus = OverlayEventBus.getInstance();
            const handler = jest.fn();
            bus.overlayOn('myDropdown', 'shown', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('overlay:myDropdown:shown')
                .withType('shown')
                .withSource('myDropdown')
                .withData({ visible: true })
                .build();
            bus.overlayEmit(ctx);

            expect(handler).toHaveBeenCalledWith(expect.objectContaining({ visible: true }));
        });
    });

    describe('overlayOnce', () => {
        it('一次性监听', () => {
            const bus = OverlayEventBus.getInstance();
            const handler = jest.fn();
            bus.overlayOnce('myDropdown', 'shown', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('overlay:myDropdown:shown')
                .withType('shown')
                .withSource('myDropdown')
                .withData({})
                .build();
            bus.overlayEmit(ctx);
            bus.overlayEmit(ctx);

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispose', () => {
        it('dispose 后不再接收事件', () => {
            const bus = OverlayEventBus.getInstance();
            const handler = jest.fn();
            bus.overlayOn('myDropdown', 'shown', handler);
            bus.dispose();

            (OverlayEventBus as any).instance = undefined;
            const bus2 = OverlayEventBus.getInstance();
            const ctx = EventContextBuilder.create()
                .withEvent('overlay:myDropdown:shown')
                .withType('shown')
                .withSource('myDropdown')
                .withData({})
                .build();
            bus2.overlayEmit(ctx);
            expect(handler).not.toHaveBeenCalled();
        });
    });
});
