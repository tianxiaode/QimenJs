import type { AbilityDefinition } from '@/composable';
import { globalEventBus, EventHandler, EventSourceRegistrar } from '@/events';
import { EventContext, EventContextBuilder, EventChainLink } from '@/context';
import { object } from '@/utils';

/**
 * EventAbility - 事件能力
 *
 * 提供事件监听、一次性监听、事件发射和 UI 事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个宿主拥有独立的事件生命周期。
 *
 * UI 事件扩展：
 * - eventKey：组件事件标识，用于事件名前缀，全局唯一
 * - emitUI()：发射 UI 事件，自动构建 EventContext
 * - executeWithEventContext()：在 handler 执行期间设置 _currentEventContext
 *
 * this 指向宿主（ComposableBase）。
 */
export const EventAbility: AbilityDefinition = {
    /**
     * 获取当前事件作用域
     *
     * 首次访问时自动初始化 eventKey（如果宿主声明了 static eventKey）。
     */
    eventScope: {
        get() {
            return this.abilityState('EventAbility:scope', () => {
                const scope = globalEventBus.createEventScope();
                this.onCleanup(() => scope.dispose());

                // 首次创建 scope 时自动初始化 eventKey
                this._initEventKey();
                // dispose 时自动注销 eventKey
                this.onCleanup(() => this._unregisterEventKey());

                return scope;
            });
        },
    },

    /**
     * 监听事件
     */
    on(event: string, handler: EventHandler) {
        return this.eventScope.on(event, handler);
    },

    /**
     * 监听一次性事件
     */
    once(event: string, handler: EventHandler) {
        return this.eventScope.once(event, handler);
    },

    /**
     * 发射事件（传统方式）
     */
    emit(event: string, data?: any) {
        this.eventScope.emit(event, data, this);
    },

    // ============================================
    // UI 事件扩展
    // ============================================

    /**
     * 初始化 eventKey
     *
     * 从静态属性读取 eventKey 并注册到 EventSourceRegistrar。
     * 在 eventScope 首次创建时自动调用。
     */
    _initEventKey() {
        const ctor = this.constructor as any;
        const key = ctor.eventKey;
        if (key) {
            this.eventKey = key;
            EventSourceRegistrar.getInstance().register(key, this);
        }
    },

    /**
     * 注销 eventKey
     *
     * 在宿主 dispose 时自动调用。
     */
    _unregisterEventKey() {
        const eventKey = this.eventKey as string | undefined;
        if (eventKey) {
            EventSourceRegistrar.getInstance().unregister(eventKey);
        }
    },

    /**
     * 发射 UI 事件
     *
     * 组件必须通过此方法发事件，不直接调用 emit。
     * 框架自动处理：
     * 1. 构建 EventContext（自动填充 event/type/source/sourceType）
     * 2. 深拷贝 data（脱离原始引用）
     * 3. 自动构建 chain（从 _currentEventContext 继承事件链路）
     * 4. 引用计数管理（EventBus.emit 中处理）
     *
     * @param event - 事件类型（如 selectionChange）
     * @param data - 事件数据载荷
     * @param domEvent - 原始 DOM 事件（可选）
     */
    emitUI(event: string, data?: any, domEvent?: Event) {
        // 1. 自动构建 chain
        const currentCtx = this._currentEventContext as EventContext | undefined;
        const chain: EventChainLink[] | undefined = currentCtx
            ? [
                ...(currentCtx.chain || []),
                { event: currentCtx.event, type: currentCtx.type!,
                  source: currentCtx.source, sourceType: currentCtx.sourceType! },
              ]
            : undefined;

        // 2. 深拷贝 data，脱离原始引用
        const clonedData = data !== undefined ? object.clone(data) : undefined;

        // 3. 构建完整事件名（eventKey:type，保证全局唯一性）
        const eventKey = this.eventKey as string | undefined;
        const fullEvent = eventKey ? `${eventKey}:${event}` : event;

        // 4. 构建 EventContext
        const ctx = EventContextBuilder.create()
            .withEvent(fullEvent)
            .withType(event)
            .withSource(eventKey ?? '')
            .withSourceType(this.constructor.name)
            .withData(clonedData)
            .withBusId(globalEventBus.getBusId())
            .withChain(chain)
            .build();

        if (domEvent) {
            ctx.domEvent = domEvent;
        }

        // 5. 通过全局事件总线发射（传入预构建的 EventContext）
        globalEventBus.emit(fullEvent, ctx);
    },

    /**
     * 在 handler 执行期间设置当前事件上下文
     *
     * 用于 bindStateTrigger 中，确保 emitUI 能正确构建 chain。
     * 同步 handler 执行完立即清除，异步 handler 等 Promise 完成后清除。
     *
     * @param handler - 要执行的 handler 函数
     * @param ctx - 当前事件上下文
     */
    executeWithEventContext<T>(handler: () => T, ctx: EventContext): T {
        this._currentEventContext = ctx;
        try {
            const result = handler();
            if (result instanceof Promise) {
                result.finally(() => { this._currentEventContext = undefined; });
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
