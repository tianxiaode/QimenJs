/**
 * 单元测试：I18nEventBridge
 *
 * 测试覆盖范围：
 * 1. 单例模式 - getInstance
 * 2. on - 注册监听并触发 tryConnect
 * 3. 取消订阅 - unsubscribe 函数正确移除监听
 * 4. dispose - 断开所有连接并清理状态
 * 5. 边界情况 - 未知事件、空 i18n、重复连接
 */

jest.mock('@qimenjs/i18n', () => ({
    getI18nManager: jest.fn(),
}));

jest.mock('@/events/SystemEventBus', () => ({
    SYSTEM_EVENTS: {
        I18N_LOCALE_CHANGE: 'i18n:localeChange',
        I18N_MESSAGES_UPDATE: 'i18n:messagesUpdate',
        WINDOW_RESIZE: 'window:resize',
        WINDOW_POP_STATE: 'window:popState',
    },
}));

jest.mock('@/events/WindowEventBridge', () => ({
    WindowEventBridge: {
        getInstance: jest.fn(() => ({
            on: jest.fn(),
            dispose: jest.fn(),
        })),
    },
}));

import { I18nEventBridge, i18nEventBridge } from '@/events/I18nEventBridge';
import { getI18nManager } from '@qimenjs/i18n';

const SYSTEM_EVENTS = {
    I18N_LOCALE_CHANGE: 'i18n:localeChange',
    I18N_MESSAGES_UPDATE: 'i18n:messagesUpdate',
};

describe('I18nEventBridge', () => {
    let mockI18n: any;
    let localeChangeCallback: any;
    let messagesUpdateCallback: any;

    beforeEach(() => {
        localeChangeCallback = null;
        messagesUpdateCallback = null;

        mockI18n = {
            onLocaleChange: jest.fn((cb: any) => {
                localeChangeCallback = cb;
                return () => {
                    localeChangeCallback = null;
                };
            }),
            onMessagesUpdate: jest.fn((cb: any) => {
                messagesUpdateCallback = cb;
                return () => {
                    messagesUpdateCallback = null;
                };
            }),
        };

        (getI18nManager as jest.Mock).mockReturnValue(mockI18n);

        I18nEventBridge.getInstance().dispose();
    });

    describe('单例模式', () => {
        it('getInstance 应返回同一实例', () => {
            const a = I18nEventBridge.getInstance();
            const b = I18nEventBridge.getInstance();
            expect(a).toBe(b);
        });

        it('i18nEventBridge 导出应为单例', () => {
            expect(i18nEventBridge).toBeDefined();
            expect(i18nEventBridge).toBeInstanceOf(I18nEventBridge);
        });
    });

    describe('on - localeChange', () => {
        it('注册 localeChange 监听后应调用 emit 回调', () => {
            const bridge = I18nEventBridge.getInstance();
            const handler = jest.fn();
            const emit = jest.fn();

            bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, handler, emit);

            if (localeChangeCallback) {
                localeChangeCallback({ previous: 'en', current: 'zh' });
            }

            expect(emit).toHaveBeenCalledWith({ previous: 'en', current: 'zh' });
        });

        it('取消订阅后应移除监听', () => {
            const bridge = I18nEventBridge.getInstance();
            const handler = jest.fn();
            const emit = jest.fn();

            const unsubscribe = bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, handler, emit);
            unsubscribe();

            if (localeChangeCallback) {
                localeChangeCallback({ previous: 'en', current: 'zh' });
            }

            expect(emit).not.toHaveBeenCalled();
        });
    });

    describe('on - messagesUpdate', () => {
        it('注册 messagesUpdate 监听后应调用 emit 回调', () => {
            const bridge = I18nEventBridge.getInstance();
            const handler = jest.fn();
            const emit = jest.fn();

            bridge.on(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, handler, emit);

            if (messagesUpdateCallback) {
                messagesUpdateCallback({ locale: 'zh' });
            }

            expect(emit).toHaveBeenCalledWith({ locale: 'zh' });
        });

        it('取消订阅后应移除监听', () => {
            const bridge = I18nEventBridge.getInstance();
            const handler = jest.fn();
            const emit = jest.fn();

            const unsubscribe = bridge.on(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, handler, emit);
            unsubscribe();

            if (messagesUpdateCallback) {
                messagesUpdateCallback({ locale: 'zh' });
            }

            expect(emit).not.toHaveBeenCalled();
        });
    });

    describe('tryConnect', () => {
        it('i18n 有 onLocaleChange 时应注册回调', () => {
            const bridge = I18nEventBridge.getInstance();
            const emit = jest.fn();

            bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, jest.fn(), emit);

            expect(mockI18n.onLocaleChange).toHaveBeenCalledWith(expect.any(Function));
        });

        it('i18n 为 null 时不应注册回调', () => {
            (getI18nManager as jest.Mock).mockReturnValue(null);

            const bridge = I18nEventBridge.getInstance();
            const emit = jest.fn();

            bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, jest.fn(), emit);

            expect(mockI18n.onLocaleChange).not.toHaveBeenCalled();
        });

        it('i18n 没有 onLocaleChange 方法时不应报错', () => {
            (getI18nManager as jest.Mock).mockReturnValue({
                onMessagesUpdate: mockI18n.onMessagesUpdate,
            });

            const bridge = I18nEventBridge.getInstance();
            const emit = jest.fn();

            expect(() => {
                bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, jest.fn(), emit);
            }).not.toThrow();
        });

        it('i18n 没有 onMessagesUpdate 方法时不应报错', () => {
            (getI18nManager as jest.Mock).mockReturnValue({
                onLocaleChange: mockI18n.onLocaleChange,
            });

            const bridge = I18nEventBridge.getInstance();
            const emit = jest.fn();

            expect(() => {
                bridge.on(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, jest.fn(), emit);
            }).not.toThrow();
        });
    });

    describe('dispose', () => {
        it('dispose 后应断开所有连接', () => {
            const bridge = I18nEventBridge.getInstance();
            const emit = jest.fn();

            bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, jest.fn(), emit);
            bridge.dispose();

            if (localeChangeCallback) {
                localeChangeCallback({ previous: 'en', current: 'zh' });
            }

            expect(emit).not.toHaveBeenCalled();
        });
    });

    describe('边界情况', () => {
        it('未知事件名应返回空 unsubscribe', () => {
            const bridge = I18nEventBridge.getInstance();
            const handler = jest.fn();
            const emit = jest.fn();

            const unsubscribe = bridge.on('unknown-event', handler, emit);
            expect(typeof unsubscribe).toBe('function');
            unsubscribe();
        });

        it('多个监听器注册同一事件', () => {
            const bridge = I18nEventBridge.getInstance();
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            const emit = jest.fn();

            bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, handler1, emit);
            bridge.on(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, handler2, emit);

            if (localeChangeCallback) {
                localeChangeCallback({ previous: 'en', current: 'zh' });
            }

            expect(emit).toHaveBeenCalled();
        });
    });
});
