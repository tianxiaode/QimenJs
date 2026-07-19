/**
 * I18nEventBridge — i18n 事件懒桥接
 *
 * 有订阅才注册 i18n 回调，全部取消才断开。
 * 桥接到 SystemEventBus，组件无需直接操作 i18n 事件。
 */

import { SYSTEM_EVENTS } from './SystemEventBus';
import { getI18nManager } from '@qimenjs/i18n';
import { ILogger, Logger } from '@qimenjs/logger';

type Unsubscribe = () => void;

export class I18nEventBridge {
    private static instance: I18nEventBridge;
    private readonly logger: ILogger = Logger.for('i18n-bridge');
    private offLocaleChange?: Unsubscribe;
    private offMessagesUpdate?: Unsubscribe;
    private connected = false;
    private localeListeners = new Set<(data: any) => void>();
    private messagesListeners = new Set<(data: any) => void>();

    private constructor() {}

    static getInstance(): I18nEventBridge {
        if (!I18nEventBridge.instance) {
            I18nEventBridge.instance = new I18nEventBridge();
        }
        return I18nEventBridge.instance;
    }

    on(event: string, handler: (data: any) => void, emit: (data: any) => void): Unsubscribe {
        if (event === SYSTEM_EVENTS.I18N_LOCALE_CHANGE) {
            this.localeListeners.add(handler);
            this.tryConnect(emit);
            return () => {
                this.localeListeners.delete(handler);
                if (this.localeListeners.size === 0) this.disconnectLocale();
            };
        }

        if (event === SYSTEM_EVENTS.I18N_MESSAGES_UPDATE) {
            this.messagesListeners.add(handler);
            this.tryConnect(emit);
            return () => {
                this.messagesListeners.delete(handler);
                if (this.messagesListeners.size === 0) this.disconnectMessages();
            };
        }

        return () => {};
    }

    private tryConnect(emit: (data: any) => void): void {
        if (this.connected) return;
        const i18n = getI18nManager();
        if (!i18n) return;

        if (typeof i18n.onLocaleChange === 'function') {
            this.offLocaleChange = i18n.onLocaleChange((e: any) => {
                emit(e);
            });
        }

        if (typeof i18n.onMessagesUpdate === 'function') {
            this.offMessagesUpdate = i18n.onMessagesUpdate((e: any) => {
                emit(e);
            });
        }

        this.connected = true;
        this.logger.debug?.('[I18nEventBridge] connected');
    }

    private disconnectLocale(): void {
        this.offLocaleChange?.();
        this.offLocaleChange = undefined;
        this.logger.debug?.('[I18nEventBridge] locale disconnected');
    }

    private disconnectMessages(): void {
        this.offMessagesUpdate?.();
        this.offMessagesUpdate = undefined;
        this.logger.debug?.('[I18nEventBridge] messages disconnected');
    }

    dispose(): void {
        this.disconnectLocale();
        this.disconnectMessages();
        this.localeListeners.clear();
        this.messagesListeners.clear();
        this.connected = false;
        this.logger.debug?.('[I18nEventBridge] disposed');
    }
}

export const i18nEventBridge = I18nEventBridge.getInstance();
