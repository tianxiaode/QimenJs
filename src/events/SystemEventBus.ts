/**
 * SystemEventBus — 系统事件总线
 *
 * 应用级系统事件的统一收发中心，拥有独立的 eventScope。
 * 类似 EntityEventBus 的设计，所有系统事件收发都经过同一个 scopeId。
 *
 * 系统事件包括：i18n 变更、权限变更、应用初始化、配置变更等。
 * 组件通过 SystemEventBusAbility 获得实例方法。
 *
 * i18n 桥接：构造时自动尝试，i18n 延迟加载时在 emit/on 时重试。
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import { ILogger, Logger } from '@qimenjs/logger';
import { getI18nManager } from '@qimenjs/i18n';

export const SYSTEM_EVENTS = {
    I18N_LOCALE_CHANGE: 'system:i18n:localeChange',
    I18N_MESSAGES_UPDATE: 'system:i18n:messagesUpdate',
    PERMISSION_CHANGE: 'system:permission:change',
    APP_INIT: 'system:app:init',
    APP_READY: 'system:app:ready',
    CONFIG_CHANGE: 'system:config:change',
} as const;

export type SystemEventName = (typeof SYSTEM_EVENTS)[keyof typeof SYSTEM_EVENTS];

export class SystemEventBus {
    private static instance: SystemEventBus;

    private readonly systemScope: IEventScope;
    private readonly logger: ILogger;
    private offI18nLocale?: () => void;
    private offI18nMessages?: () => void;
    private i18nConnected = false;

    private constructor() {
        this.systemScope = globalEventBus.createEventScope();
        this.logger = Logger.for('system-bus');
        this.logger.debug?.(
            '[SystemEventBus] initialized, scopeId =',
            this.systemScope.getScopeId()
        );
        this.tryConnectI18n();
    }

    static getInstance(): SystemEventBus {
        if (!SystemEventBus.instance) {
            SystemEventBus.instance = new SystemEventBus();
        }
        return SystemEventBus.instance;
    }

    getScopeId(): string {
        return this.systemScope.getScopeId();
    }

    private tryConnectI18n(): void {
        if (this.i18nConnected) return;
        const i18n = getI18nManager();
        if (!i18n) return;

        if (typeof i18n.onLocaleChange === 'function') {
            this.offI18nLocale = i18n.onLocaleChange((e: any) => {
                this.emit(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, e);
            });
        }

        if (typeof i18n.onMessagesUpdate === 'function') {
            this.offI18nMessages = i18n.onMessagesUpdate((e: any) => {
                this.emit(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, e);
            });
        }

        this.i18nConnected = true;
        this.logger.debug?.('[SystemEventBus] i18n bridge connected');
    }

    emit(event: string, data?: any): void {
        this.logger.debug?.('[SystemEventBus] emit, event =', event);
        this.systemScope.emit(event, data);
    }

    on(event: string, handler: (data: any) => void): () => void {
        this.tryConnectI18n();
        this.logger.debug?.('[SystemEventBus] on, event =', event);
        return this.systemScope.on(event, (ctx: any) => {
            const d = ctx?.data !== undefined ? ctx.data : ctx;
            handler(d);
        });
    }

    once(event: string, handler: (data: any) => void): void {
        this.logger.debug?.('[SystemEventBus] once, event =', event);
        this.systemScope.once(event, (ctx: any) => {
            const d = ctx?.data !== undefined ? ctx.data : ctx;
            handler(d);
        });
    }

    dispose(): void {
        this.offI18nLocale?.();
        this.offI18nMessages?.();
        this.offI18nLocale = undefined;
        this.offI18nMessages = undefined;
        this.i18nConnected = false;
        this.systemScope.dispose();
        this.logger.debug?.('[SystemEventBus] disposed');
    }
}

export const systemEventBus = SystemEventBus.getInstance();
