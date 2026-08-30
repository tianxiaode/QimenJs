/**
 * EventsAbility — 统一事件能力
 *
 * 整合本地事件作用域与全部事件总线为单一能力，AI 与开发者只需 use(EventsAbility)。
 * 通过方法前缀区分目标总线，每个方法静态转发到对应总线单例（无运行时分发）：
 *
 * | 前缀        | 总线             | 方法                                       |
 * |-------------|------------------|--------------------------------------------|
 * | （无前缀）  | 本地事件作用域   | on / once / emit                           |
 * | system*     | SystemEventBus   | systemEmit / systemOn / systemOnce         |
 * | component*  | ComponentEventBus| componentEmit / componentOn / componentOnce|
 * | entity*     | EntityEventBus   | entityEmit / entityOn / entityOnce         |
 * | overlay*    | OverlayEventBus  | overlayEmit / overlayOn / overlayOnce      |
 * | route*      | RouteEventBus    | routeEmit / routeOn / routeOnce            |
 * | file*       | FileEventBus     | fileEmit / fileOn / fileOnce               |
 * | drag*       | DragEventBus     | dragEmit / dragOn / dragStart 等           |
 *
 * eventCtx 统一构建 EventContext，自动填充 event / type / source / sourceType，
 * AI 不再直接接触 EventContextBuilder。
 *
 * 所有 *Emit 统一签名 (event, dataOrCtx?, overrides?)：
 * - dataOrCtx 传普通数据 → 内部自动 eventCtx
 * - dataOrCtx 传 EventContext → 直接使用（overrides 仍可覆盖字段）
 * - overrides 用于覆盖默认字段（如 source / type / sourceType）
 *
 * this 指向宿主（ComposableBase）。
 */

import type { AbilityDefinition } from '@/composable';
import {
    globalEventBus,
    EventHandler,
    EventSourceRegistrar,
    SystemEventBus,
    ComponentEventBus,
    EntityEventBus,
    OverlayEventBus,
    DragEventBus,
    RouteEventBus,
    FileEventBus,
    type DragState,
    type DragAction,
} from '@/events';
import { EventContext, EventContextBuilder } from '@/context';

function _isEventContext(value: any): value is EventContext {
    return !!value && typeof value === 'object' && 'event' in value && 'scopeId' in value;
}

export const EventsAbility = {
    // ============================================================
    // EventContext 构建
    // ============================================================

    /**
     * 构建 EventContext（自动填充 source / sourceType）
     *
     * @param event - 事件名称
     * @param data - 事件数据
     * @param overrides - 覆盖默认字段（source / type / sourceType 等）
     */
    eventCtx(event: string, data?: any, overrides?: Partial<EventContext>): EventContext {
        const ctx = EventContextBuilder.create()
            .withEvent(event)
            .withType(event)
            .withSource(
                this.eventKey ??
                    (this.constructor as any).eventKey ??
                    this.constructor.name
            )
            .withSourceType(this.constructor.name)
            .withData(data)
            .build();
        return overrides ? { ...ctx, ...overrides } : ctx;
    },

    /** 内部：将 (event, dataOrCtx) 解析为 EventContext */
    _resolveCtx(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): EventContext {
        if (_isEventContext(dataOrCtx)) {
            return overrides ? { ...dataOrCtx, ...overrides } : dataOrCtx;
        }
        return this.eventCtx(event, dataOrCtx, overrides);
    },

    // ============================================================
    // 本地事件作用域（EventScope）
    // ============================================================

    eventScope: {
        get() {
            return this.abilityState('EventsAbility:scope', () => {
                const scope = globalEventBus.createEventScope();
                this.onCleanup(() => scope.dispose());

                this._initEventKey();
                this.onCleanup(() => this._unregisterEventKey());

                return scope;
            });
        },
    },

    on(event: string, handler: EventHandler) {
        return this.eventScope.on(event, handler);
    },

    once(event: string, handler: EventHandler) {
        return this.eventScope.once(event, handler);
    },

    /** 发射本地事件，支持 (event, data) 快捷方式或预构建 EventContext */
    emit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>) {
        const ctx = this._resolveCtx(event, dataOrCtx, overrides);
        this.logger?.debug?.(
            '[Event] emit, event =',
            event,
            'source =',
            ctx.source,
            'data =',
            ctx.data
        );
        this.eventScope.emit(event, ctx);
    },

    executeWithEventContext<T>(handler: () => T, ctx: EventContext): T {
        this._currentEventContext = ctx;
        try {
            const result = handler();
            if (result instanceof Promise) {
                result.finally(() => {
                    this._currentEventContext = undefined;
                });
            } else {
                this._currentEventContext = undefined;
            }
            return result;
        } catch {
            this._currentEventContext = undefined;
            throw undefined;
        }
    },

    _initEventKey() {
        const ctor = this.constructor as any;
        const key = ctor.eventKey;
        if (key) {
            this.eventKey = key;
            EventSourceRegistrar.getInstance().register(key, this);
        }
    },

    _unregisterEventKey() {
        const eventKey = this.eventKey as string | undefined;
        if (eventKey) {
            EventSourceRegistrar.getInstance().unregister(eventKey);
        }
    },

    // ============================================================
    // system* — 系统事件总线
    // ============================================================

    systemEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        SystemEventBus.getInstance().emit(event, this._resolveCtx(event, dataOrCtx, overrides));
    },

    systemOn(event: string, handler: (data: any) => void): () => void {
        const off = SystemEventBus.getInstance().on(event, handler);
        this.onCleanup(off);
        return off;
    },

    systemOnce(event: string, handler: (data: any) => void): void {
        SystemEventBus.getInstance().once(event, handler);
    },

    // ============================================================
    // component* — 组件事件总线
    // ============================================================

    componentEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        ComponentEventBus.getInstance().componentEmit(
            this._resolveCtx(event, dataOrCtx, overrides)
        );
    },

    componentOn(sourceId: string, eventName: string, handler: (data: any) => void): () => void {
        const off = ComponentEventBus.getInstance().componentOn(sourceId, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    componentOnce(sourceId: string, eventName: string, handler: (data: any) => void): void {
        ComponentEventBus.getInstance().componentOnce(sourceId, eventName, handler);
    },

    // ============================================================
    // entity* — 实体事件总线
    // ============================================================

    entityEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        EntityEventBus.getInstance().entityEmit(this._resolveCtx(event, dataOrCtx, overrides));
    },

    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void {
        const off = EntityEventBus.getInstance().entityOn(entityKey, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    entityOnce(entityKey: string, eventName: string, handler: (data: any) => void): void {
        EntityEventBus.getInstance().entityOnce(entityKey, eventName, handler);
    },

    // ============================================================
    // overlay* — 浮层事件总线
    // ============================================================

    overlayEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        OverlayEventBus.getInstance().overlayEmit(this._resolveCtx(event, dataOrCtx, overrides));
    },

    overlayOn(overlayKey: string, action: string, handler: (data: any) => void): () => void {
        const off = OverlayEventBus.getInstance().overlayOn(overlayKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    overlayOnce(overlayKey: string, action: string, handler: (data: any) => void): void {
        OverlayEventBus.getInstance().overlayOnce(overlayKey, action, handler);
    },

    // ============================================================
    // route* — 路由事件总线
    // ============================================================

    routeEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        RouteEventBus.getInstance().routeEmit(this._resolveCtx(event, dataOrCtx, overrides));
    },

    routeOn(routeKey: string, eventName: string, handler: (data: any) => void): () => void {
        const off = RouteEventBus.getInstance().routeOn(routeKey, eventName, handler);
        this.onCleanup(off);
        return off;
    },

    routeOnce(routeKey: string, eventName: string, handler: (data: any) => void): void {
        RouteEventBus.getInstance().routeOnce(routeKey, eventName, handler);
    },

    // ============================================================
    // file* — 文件事件总线
    // ============================================================

    fileEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        FileEventBus.getInstance().fileEmit(this._resolveCtx(event, dataOrCtx, overrides));
    },

    fileOn(fileKey: string, action: string, handler: (data: any) => void): () => void {
        const off = FileEventBus.getInstance().fileOn(fileKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    fileOnce(fileKey: string, action: string, handler: (data: any) => void): void {
        FileEventBus.getInstance().fileOnce(fileKey, action, handler);
    },

    // ============================================================
    // drag* — 拖拽事件总线
    // ============================================================

    dragEmit(event: string, dataOrCtx?: any, overrides?: Partial<EventContext>): void {
        DragEventBus.getInstance().dragEmit(this._resolveCtx(event, dataOrCtx, overrides));
    },

    dragStart(dragKey: string, state: Omit<DragState, 'dragKey'>): void {
        DragEventBus.getInstance().dragStart(dragKey, state);
    },

    dragEnd(dragKey: string): void {
        DragEventBus.getInstance().dragEnd(dragKey);
    },

    dragCancel(dragKey: string): void {
        DragEventBus.getInstance().dragCancel(dragKey);
    },

    dragEnter(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        DragEventBus.getInstance().dragEnter(dragKey, dropTarget, dropEl);
    },

    dragLeave(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        DragEventBus.getInstance().dragLeave(dragKey, dropTarget, dropEl);
    },

    dragDrop(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        DragEventBus.getInstance().dragDrop(dragKey, dropTarget, dropEl);
    },

    dragOn(dragKey: string, action: DragAction, handler: (data: any) => void): () => void {
        const off = DragEventBus.getInstance().dragOn(dragKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    dragOnce(dragKey: string, action: DragAction, handler: (data: any) => void): void {
        DragEventBus.getInstance().dragOnce(dragKey, action, handler);
    },

    getActiveDrag(): DragState | null {
        return DragEventBus.getInstance().getActiveDrag();
    },

    isDragging(): boolean {
        return DragEventBus.getInstance().isDragging();
    },
} satisfies AbilityDefinition;
