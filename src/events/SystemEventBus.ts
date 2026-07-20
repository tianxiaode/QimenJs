/**
 * SystemEventBus — 系统事件总线
 *
 * 应用级系统事件的统一收发中心，拥有独立的 eventScope。
 * 类似 EntityEventBus 的设计，所有系统事件收发都经过同一个 scopeId。
 *
 * 系统事件包括：i18n 变更、权限变更、应用初始化、配置变更、窗口事件等。
 * 组件通过 SystemEventBusAbility 获得实例方法。
 *
 * 懒桥接：
 * - i18n 事件通过 I18nEventBridge，有订阅才注册回调
 * - 窗口事件通过 WindowEventBridge，有订阅才 addEventListener
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { EventContextBuilder } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';
import { WindowEventBridge } from './WindowEventBridge';
import { I18nEventBridge } from './I18nEventBridge';

const WINDOW_EVENT_PREFIX = 'window:';
const I18N_EVENT_PREFIX = 'i18n:';

export const SYSTEM_EVENTS = {
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
} as const;

export type SystemEventName = (typeof SYSTEM_EVENTS)[keyof typeof SYSTEM_EVENTS];

export class SystemEventBus {
    private static instance: SystemEventBus;

    private readonly systemScope: IEventScope;
    private readonly logger: ILogger;
    private readonly windowBridge: WindowEventBridge;
    private readonly i18nBridge: I18nEventBridge;

    private constructor() {
        this.systemScope = globalEventBus.createEventScope();
        this.windowBridge = WindowEventBridge.getInstance();
        this.i18nBridge = I18nEventBridge.getInstance();
        this.logger = Logger.for('system-bus');
        this.logger.debug?.(
            '[SystemEventBus] initialized, scopeId =',
            this.systemScope.getScopeId()
        );
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

    emit(event: string, data?: any): void {
        if (event.startsWith(WINDOW_EVENT_PREFIX) || event.startsWith(I18N_EVENT_PREFIX)) {
            this.logger.warn?.(
                '[SystemEventBus] emit rejected: i18n/window events are auto-bridged, event =',
                event
            );
            return;
        }
        this.logger.debug?.('[SystemEventBus] emit, event =', event);
        const ctx = EventContextBuilder.create()
            .withEvent(event)
            .withType(event)
            .withSource('system')
            .withData(data)
            .build();
        this.systemScope.emit(event, ctx);
    }

    _bridgeEmit(event: string, data?: any): void {
        const ctx = EventContextBuilder.create()
            .withEvent(event)
            .withType(event)
            .withSource('system')
            .withData(data)
            .build();
        this.systemScope.emit(event, ctx);
    }

    on(event: string, handler: (data: any) => void): () => void {
        this.logger.debug?.('[SystemEventBus] on, event =', event);

        const offScope = this.systemScope.on(event, (ctx: any) => {
            const d = ctx?.data !== undefined ? ctx.data : ctx;
            handler(d);
        });

        if (event.startsWith(WINDOW_EVENT_PREFIX)) {
            const offBridge = this.windowBridge.on(event, handler, (data: any) => {
                this._bridgeEmit(event, data);
            });
            return () => {
                offScope();
                offBridge();
            };
        }

        if (event.startsWith(I18N_EVENT_PREFIX)) {
            const offBridge = this.i18nBridge.on(event, handler, (data: any) => {
                this._bridgeEmit(event, data);
            });
            return () => {
                offScope();
                offBridge();
            };
        }

        return offScope;
    }

    once(event: string, handler: (data: any) => void): void {
        this.logger.debug?.('[SystemEventBus] once, event =', event);
        this.systemScope.once(event, (ctx: any) => {
            const d = ctx?.data !== undefined ? ctx.data : ctx;
            handler(d);
        });
    }

    dispose(): void {
        this.i18nBridge.dispose();
        this.windowBridge.dispose();
        this.systemScope.dispose();
        this.logger.debug?.('[SystemEventBus] disposed');
    }
}

export const systemEventBus = SystemEventBus.getInstance();
