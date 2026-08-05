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

jest.mock('@/events/SystemEventBus', () => ({
    SYSTEM_EVENTS: {
        I18N_LOCALE_CHANGE: 'i18n:localeChange',
        I18N_MESSAGES_UPDATE: 'i18n:messagesUpdate',
        PERMISSION_CHANGE: 'permission:change',
        APP_INIT: 'app:init',
        APP_READY: 'app:ready',
        CONFIG_CHANGE: 'config:change',
        THEME_CHANGE: 'window:themeChange',
        WINDOW_RESIZE: 'window:resize',
        VISIBILITY_CHANGE: 'window:visibilityChange',
        NETWORK_CHANGE: 'window:networkChange',
        ORIENTATION_CHANGE: 'window:orientationChange',
        MEDIA_QUERY_CHANGE: 'window:mediaQueryChange',
        WINDOW_HASH_CHANGE: 'window:hashChange',
        WINDOW_POP_STATE: 'window:popState',
    },
    SystemEventBus: {
        getInstance: jest.fn(() => ({
            on: jest.fn(() => jest.fn()),
            emit: jest.fn(),
            _bridgeEmit: jest.fn(),
            dispose: jest.fn(),
        })),
    },
}));

import { WindowEventBridge } from '@/events/WindowEventBridge';
import { SYSTEM_EVENTS } from '@/events/SystemEventBus';

describe('WindowEventBridge', () => {
    let bridge: WindowEventBridge;

    beforeEach(() => {
        (WindowEventBridge as any).instance = undefined;
        bridge = WindowEventBridge.getInstance();
    });

    afterEach(() => {
        bridge.dispose();
        (WindowEventBridge as any).instance = undefined;
    });

    describe('getInstance', () => {
        it('returns singleton', () => {
            const a = WindowEventBridge.getInstance();
            const b = WindowEventBridge.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('on', () => {
        it('WINDOW_RESIZE adds resize listener and dispatches to handlers', async () => {
            const emit = jest.fn();
            const handler = jest.fn();

            bridge.on(SYSTEM_EVENTS.WINDOW_RESIZE, handler, emit);

            window.dispatchEvent(new UIEvent('resize'));

            await new Promise(r => setTimeout(r, 200));

            expect(handler).toHaveBeenCalled();
            expect(emit).toHaveBeenCalled();
        });

        it('VISIBILITY_CHANGE adds visibilitychange listener', () => {
            const emit = jest.fn();
            const handler = jest.fn();

            bridge.on(SYSTEM_EVENTS.VISIBILITY_CHANGE, handler, emit);

            Object.defineProperty(document, 'visibilityState', {
                value: 'visible',
                configurable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));

            expect(handler).toHaveBeenCalled();
        });

        it('WINDOW_HASH_CHANGE adds hashchange listener', () => {
            const emit = jest.fn();
            const handler = jest.fn();

            bridge.on(SYSTEM_EVENTS.WINDOW_HASH_CHANGE, handler, emit);

            window.dispatchEvent(new HashChangeEvent('hashchange'));

            expect(handler).toHaveBeenCalled();
        });

        it('WINDOW_POP_STATE adds popstate listener', () => {
            const emit = jest.fn();
            const handler = jest.fn();

            bridge.on(SYSTEM_EVENTS.WINDOW_POP_STATE, handler, emit);

            window.dispatchEvent(new PopStateEvent('popstate'));

            expect(handler).toHaveBeenCalled();
        });

        it('NETWORK_CHANGE adds online/offline listeners', () => {
            const emit = jest.fn();
            const handler = jest.fn();

            bridge.on(SYSTEM_EVENTS.NETWORK_CHANGE, handler, emit);

            window.dispatchEvent(new Event('online'));

            expect(handler).toHaveBeenCalled();
        });

        it('unsubscribe stops receiving events', () => {
            const emit = jest.fn();
            const handler = jest.fn();

            const off = bridge.on(SYSTEM_EVENTS.WINDOW_HASH_CHANGE, handler, emit);
            off();

            window.dispatchEvent(new HashChangeEvent('hashchange'));

            expect(handler).not.toHaveBeenCalled();
        });

        it('last unsubscribe removes DOM listener', () => {
            const emit = jest.fn();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            const removeSpy = jest.spyOn(window, 'removeEventListener');
            const off1 = bridge.on(SYSTEM_EVENTS.WINDOW_HASH_CHANGE, handler1, emit);
            const off2 = bridge.on(SYSTEM_EVENTS.WINDOW_HASH_CHANGE, handler2, emit);

            off1();
            expect(removeSpy).not.toHaveBeenCalledWith('hashchange', expect.any(Function));

            off2();
            expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
            removeSpy.mockRestore();
        });
    });

    describe('unknown event', () => {
        it('throws for unknown event type', () => {
            expect(() => bridge.on('window:unknown', jest.fn(), jest.fn())).toThrow(
                /unknown window event/
            );
        });
    });

    describe('dispose', () => {
        it('removes all DOM listeners and clears handlers', () => {
            const emit = jest.fn();
            const handler = jest.fn();

            bridge.on(SYSTEM_EVENTS.WINDOW_HASH_CHANGE, handler, emit);
            bridge.dispose();

            window.dispatchEvent(new HashChangeEvent('hashchange'));

            expect(handler).not.toHaveBeenCalled();
        });
    });
});
