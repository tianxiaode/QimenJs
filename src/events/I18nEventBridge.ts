，不/**
 * I18nEventBridge i18n 事件桥接器
 *
 * 将 I18nManager 自身的 locale:change 和 messages:update 事件
 * 转换为框架标准的 EventContext，通过 globalEventBus 广播。
 *
 * 设计为单例模式，应用启动时调用 i18nEventBridge.connect(i18nManager) 即可。
 * 在 Vue/React 项目中同样适用——不依赖组件框架。
 *
 * @example
 * ```typescript
 * // 应用启动时
 * import { i18nEventBridge } from '@qimenjs/events';
 * import { i18n } from '@qimenjs/i18n';
 *
 * i18nEventBridge.connect(i18n);
 * // 之后所有监听 globalEventBus 'localeChange' 事件的组件自动响应语言切换
 * ```
 */

import { globalEventBus } from './GlobalEventBus';

export interface I18nEventBridgeConfig {
    /** I18nManager 实例 */
    i18n: any;
    /** GlobalEventBus 实例，不提供则使用默认的 globalEventBus */
    eventBus?: any;
    /** localeChange 事件在 EventBus 上的事件名 */
    localeChangeEventName?: string;
    /** messagesUpdate 事件在 EventBus 上的事件名 */
    messagesUpdateEventName?: string;
}

export class I18nEventBridge {
    private i18n: any;
    private eventBus: any;
    private localeChangeEventName: string;
    private messagesUpdateEventName: string;
    private connected = false;
    private offLocaleChange?: () => void;
    private offMessagesUpdate?: () => void;

    constructor(config: I18nEventBridgeConfig) {
        this.i18n = config.i18n;
        this.localeChangeEventName = config.localeChangeEventName ?? 'localeChange';
        this.messagesUpdateEventName = config.messagesUpdateEventName ?? 'messagesUpdate';
        this.eventBus = config.eventBus || globalEventBus;
    }

    /**
     * 连接桥接器
     *
     * 开始监听 I18nManager 事件并转发到 globalEventBus
     */
    connect(): void {
        if (this.connected || !this.i18n || !this.eventBus) return;

        // 监听 I18nManager 的 locale:change 事件
        if (typeof this.i18n.onLocaleChange === 'function') {
            this.offLocaleChange = this.i18n.onLocaleChange((event: any) => {
                this.emitLocaleChange(event);
            });
        }

        // 监听 I18nManager 的 messages:update 事件
        if (typeof this.i18n.onMessagesUpdate === 'function') {
            this.offMessagesUpdate = this.i18n.onMessagesUpdate((event: any) => {
                this.emitMessagesUpdate(event);
            });
        }

        this.connected = true;
    }

    /**
     * 断开桥接器
     */
    disconnect(): void {
        if (!this.connected) return;

        this.offLocaleChange?.();
        this.offMessagesUpdate?.();
        this.connected = false;
    }

    /**
     * 是否已连接
     */
    get isConnected(): boolean {
        return this.connected;
    }

    /**
     * 发射 localeChange 事件
     */
    private emitLocaleChange(event: any): void {
        try {
            const { EventContextBuilder } = require('@qimenjs/context');
            const ctx = EventContextBuilder.create()
                .withEvent(this.localeChangeEventName)
                .withType('localeChange')
                .withSource('i18n')
                .withSourceType('I18nManager')
                .withData({ previous: event.previous, current: event.current })
                .build();

            this.eventBus.emit(this.localeChangeEventName, ctx);
        } catch (e) {
            // EventContextBuilder 不可用，使用简单格式
            this.eventBus.emit(this.localeChangeEventName, {
                previous: event.previous,
                current: event.current,
            });
        }
    }

    /**
     * 发射 messagesUpdate 事件
     */
    private emitMessagesUpdate(event: any): void {
        try {
            const { EventContextBuilder } = require('@qimenjs/context');
            const ctx = EventContextBuilder.create()
                .withEvent(this.messagesUpdateEventName)
                .withType('messagesUpdate')
                .withSource('i18n')
                .withSourceType('I18nManager')
                .withData({ locale: event.locale })
                .build();

            this.eventBus.emit(this.messagesUpdateEventName, ctx);
        } catch (e) {
            this.eventBus.emit(this.messagesUpdateEventName, {
                locale: event.locale,
            });
        }
    }
}

/**
 * I18nEventBridge 全局单例
 *
 * 应用启动时调用 i18nEventBridge.connect(i18nManager) 即可开始桥接。
 * 不使用组件时也需要（如 Vue/React 项目中直接使用 i18n）。
 *
 * @example
 * ```typescript
 * import { i18nEventBridge } from '@qimenjs/events';
 * import { i18n } from '@qimenjs/i18n';
 *
 * i18nEventBridge.connect(i18n);
 * ```
 */
export const i18nEventBridge = new I18nEventBridge({ i18n: null });
