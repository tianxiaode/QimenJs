import type { AbilityDefinition } from '@/composable';
import { globalEventBus, EventHandler, EventSourceRegistrar } from '@/events';
import { EventContext, EventContextBuilder, EventChainLink } from '@/context';
import { object } from '@/utils';

/**
 * EventAbility - 事件能力
 *
 * 提供事件监听、一次性监听、事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个宿主拥有独立的事件生命周期。
 *
 * emit 统一入口，内部自动构建 EventContext：
 * - emit(event, data) → 构建 ctx，走 eventScope.emit()
 * - emit(event, data, { source }) → 构建 ctx（含 source/chain），走 eventScope.emit()
 *   scopeId 由 EventScope.emit 自动补回
 *
 * 桥接的关键是 source：通过 source 找到对应组件实例，在其 eventScope 上注册监听。
 * scopeId 只是 EventScope 内部自带的标识，用于 EventBus 层面的事件路由。
 *
 * this 指向宿主（ComposableBase）。
 */
export const EventAbility: AbilityDefinition = {
    eventScope: {
        get() {
            return this.abilityState('EventAbility:scope', () => {
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

    /**
     * 发射事件（统一入口）
     *
     * 内部自动构建 EventContext，通过 eventScope.emit 发布。
     * scopeId 由 EventScope.emit 自动补回。
     *
     * @param event - 事件名称
     * @param data - 事件数据载荷
     * @param options - 可选配置：
     *   - source: 事件源标识（如 eventKey），桥接的关键
     *   - domEvent: 原始 DOM 事件（可选）
     */
    emit(event: string, data?: any, options?: { source?: any; domEvent?: Event }) {
        this.logger?.debug?.(
            '[Event] emit, event =',
            event,
            'hasSource =',
            !!options?.source,
            'data =',
            data
        );

        const currentCtx = this._currentEventContext as EventContext | undefined;
        const chain: EventChainLink[] | undefined = currentCtx
            ? [
                  ...(currentCtx.chain || []),
                  {
                      event: currentCtx.event,
                      type: currentCtx.type!,
                      source: currentCtx.source,
                      sourceType: currentCtx.sourceType!,
                  },
              ]
            : undefined;

        const clonedData = data !== undefined ? object.clone(data) : undefined;
        const eventKey = this.eventKey as string | undefined;
        const source = options?.source ?? eventKey ?? '';

        const ctx = EventContextBuilder.create()
            .withEvent(event)
            .withType(event)
            .withSource(source)
            .withSourceType(this.constructor.name)
            .withData(clonedData)
            .withBusId(globalEventBus.getBusId())
            .withChain(chain)
            .build();

        if (options?.domEvent) {
            ctx.domEvent = options.domEvent;
        }

        this.eventScope.emit(event, ctx);
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
};
