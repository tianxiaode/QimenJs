/**
 * I18nEventBridge i18n 事件桥接器
 *
 * 将 I18nManager 自身的 locale:change 和 messages:update 事件
 * 转换为框架标准的 EventContext，通过 globalEventBus 广播
 */

import type { EventContextBuilder } from '@qimenjs/context';

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

        // 延迟导入避免循环依赖
        if (config.eventBus) {
            this.eventBus = config.eventBus;
        } else {
            try {
                const { globalEventBus } = require('@qimenjs/events');
                this.eventBus = globalEventBus;
            } catch (e) {
                this.eventBus = null;
            }
        }
    }

    /**
     * 连接桥接器
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
