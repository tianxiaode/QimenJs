/**
 * OverlayEventBus 浮层事件总线
 *
 * 统一管理所有浮层（tooltip/dropdown/popover）事件的发送和监听，
 * 使用独立的 eventScope，与组件事件、桥接事件、实体事件互不干扰。
 *
 * 事件名编码：overlay:{overlayKey}:{action}
 * 事件数据始终携带 component 实例和 anchor 元素，确保浮层能锚定到正确的组件。
 *
 * @example
 * ```ts
 * const bus = OverlayEventBus.getInstance();
 *
 * // 显示浮层（组件侧）
 * bus.overlayEmit('myDropdown', 'show', { component: this, anchor: this.el, config: {...} });
 *
 * // 监听浮层事件
 * bus.overlayOn('myDropdown', 'shown', (data) => {
 *     console.log('浮层已显示:', data);
 * });
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';

import { ILogger, Logger } from '@qimenjs/logger';

function encodeOverlayEvent(overlayKey: string, action: string): string {
    return `overlay:${overlayKey}:${action}`;
}

export class OverlayEventBus {
    private static instance: OverlayEventBus;

    private readonly overlayScope: IEventScope;
    private readonly logger: ILogger;
    private readonly initHandlers: Array<(component: any, floats: Record<string, any>) => void> = [];

    private constructor() {
        this.overlayScope = globalEventBus.createEventScope();
        this.logger = Logger.for('overlay-bus');
        this.logger.debug?.(
            '[OverlayEventBus] initialized, scopeId =',
            this.overlayScope.getScopeId()
        );
    }

    onInit(handler: (component: any, floats: Record<string, any>) => void): void {
        this.initHandlers.push(handler);
    }

    emitInit(component: any, floats: Record<string, any>): void {
        for (const handler of this.initHandlers) {
            handler(component, floats);
        }
    }

    static getInstance(): OverlayEventBus {
        if (!OverlayEventBus.instance) {
            OverlayEventBus.instance = new OverlayEventBus();
        }
        return OverlayEventBus.instance;
    }

    getScopeId(): string {
        return this.overlayScope.getScopeId();
    }

    /**
     * 发送浮层事件（只接收 EventContext）
     *
     * 事件总线统一约定：只接收 EventContext，由发送方构建。
     * 从 ctx.source 提取 overlayKey，从 ctx.type 提取 action。
     *
     * @param ctx - 预构建的 EventContext
     */
    overlayEmit(ctx: EventContext): void {
        const overlayKey = ctx.source;
        const action = ctx.type!;
        const overlayEvent = encodeOverlayEvent(overlayKey, action);
        this.logger.debug?.(
            '[OverlayEventBus] overlayEmit, overlayKey =',
            overlayKey,
            'action =',
            action
        );
        this.overlayScope.emit(overlayEvent, ctx);
    }

    overlayOn(overlayKey: string, action: string, handler: (data: any) => void): () => void {
        const overlayEvent = encodeOverlayEvent(overlayKey, action);
        this.logger.debug?.(
            '[OverlayEventBus] overlayOn, overlayKey =',
            overlayKey,
            'action =',
            action
        );
        return this.overlayScope.on(overlayEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    overlayOnce(overlayKey: string, action: string, handler: (data: any) => void): void {
        const overlayEvent = encodeOverlayEvent(overlayKey, action);
        this.overlayScope.once(overlayEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    dispose(): void {
        this.overlayScope.dispose();
        this.logger.debug?.('[OverlayEventBus] disposed');
    }
}

export const overlayEventBus = OverlayEventBus.getInstance();
