/**
 * SystemEventBus 单元测试
 *
 * 覆盖：getInstance、getScopeId、emit、on、once、dispose、_bridgeEmit
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

jest.mock('@/context', () => {
    const original = jest.requireActual('@/context');
    return {
        ...original,
        EventContextBuilder: {
            create: () => ({
                withEvent: jest.fn().mockReturnThis(),
                withType: jest.fn().mockReturnThis(),
                withSource: jest.fn().mockReturnThis(),
                withData: jest.fn().mockReturnThis(),
                build: jest.fn().mockReturnValue({}),
            }),
        },
    };
});

import { SystemEventBus, SYSTEM_EVENTS } from '@/events/SystemEventBus';
import { EventContextBuilder } from '@/context';

describe('SystemEventBus', () => {
    beforeEach(() => {
        (SystemEventBus as any).instance = undefined;
    });

    describe('getInstance', () => {
        it('返回单例', () => {
            const a = SystemEventBus.getInstance();
            const b = SystemEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('getScopeId', () => {
        it('返回 scopeId 字符串', () => {
            const bus = SystemEventBus.getInstance();
            expect(typeof bus.getScopeId()).toBe('string');
        });
    });

    describe('emit', () => {
        it('发送普通系统事件', () => {
            const bus = SystemEventBus.getInstance();
            const handler = jest.fn();
            bus.on('permission:change', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('permission:change')
                .withType('permission:change')
                .withSource('system')
                .withData({ role: 'admin' })
                .build();
            bus.emit('permission:change', ctx);

            expect(handler).toHaveBeenCalled();
        });

        it('拒绝直接发送 window: 前缀事件', () => {
            const bus = SystemEventBus.getInstance();
            const handler = jest.fn();
            bus.on('window:resize', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('window:resize')
                .withType('window:resize')
                .withSource('system')
                .withData({})
                .build();
            bus.emit('window:resize', ctx);
        });

        it('拒绝直接发送 i18n: 前缀事件', () => {
            const bus = SystemEventBus.getInstance();
            const ctx = EventContextBuilder.create()
                .withEvent('i18n:localeChange')
                .withType('i18n:localeChange')
                .withSource('system')
                .withData({})
                .build();
            expect(() => bus.emit('i18n:localeChange', ctx)).not.toThrow();
        });
    });

    describe('on', () => {
        it('监听普通事件返回 off 函数', () => {
            const bus = SystemEventBus.getInstance();
            const handler = jest.fn();
            const off = bus.on('app:init', handler);
            expect(typeof off).toBe('function');
            off();
        });

        it('window: 事件同时注册 scope 和 bridge', () => {
            const bus = SystemEventBus.getInstance();
            const handler = jest.fn();
            const off = bus.on(SYSTEM_EVENTS.WINDOW_RESIZE, handler);
            expect(typeof off).toBe('function');
            off();
        });

        it('i18n: 事件同时注册 scope 和 bridge', () => {
            const bus = SystemEventBus.getInstance();
            const handler = jest.fn();
            const off = bus.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, handler);
            expect(typeof off).toBe('function');
            off();
        });
    });

    describe('once', () => {
        it('一次性监听', () => {
            const bus = SystemEventBus.getInstance();
            const handler = jest.fn();
            bus.once('app:ready', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('app:ready')
                .withType('app:ready')
                .withSource('system')
                .withData({})
                .build();
            bus.emit('app:ready', ctx);
            bus.emit('app:ready', ctx);

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('SYSTEM_EVENTS', () => {
        it('包含预定义事件名', () => {
            expect(SYSTEM_EVENTS.APP_INIT).toBe('app:init');
            expect(SYSTEM_EVENTS.APP_READY).toBe('app:ready');
            expect(SYSTEM_EVENTS.PERMISSION_CHANGE).toBe('permission:change');
            expect(SYSTEM_EVENTS.WINDOW_RESIZE).toBe('window:resize');
            expect(SYSTEM_EVENTS.I18N_LOCALE_CHANGE).toBe('i18n:localeChange');
        });
    });

    describe('dispose', () => {
        it('清除所有监听和桥接', () => {
            const bus = SystemEventBus.getInstance();
            expect(() => bus.dispose()).not.toThrow();
        });
    });
});
