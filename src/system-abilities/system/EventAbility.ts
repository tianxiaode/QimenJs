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
 * emit 统一入口，通过第三个参数 options 分流：
 * - emit(event, data) → 传统模式，走 eventScope.emit()
 * - emit(event, data, { source }) → UI 事件模式，
 *   自动构建 EventContext（含 source/scopeId/chain 等），走 eventScope.emit()
 *   scopeId 由 eventScope 内部自动绑定，无需手动传入
 *
 * 桥接的关键是 source：通过 source 找到对应组件实例，在其 eventScope 上注册监听。
 * scopeId 只是 EventScope 内部自带的标识，用于 EventBus 层面的事件路由。
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
     * 发射事件（统一入口）
     *
     * 通过第三个参数 options 分流：
     * - 无 options → 传统模式，直接走 eventScope.emit()
     * - 有 options（含 source）→ UI 事件模式，
     *   自动构建 EventContext（含 chain/type/sourceType 等），走 eventScope.emit()
     *   scopeId 由 eventScope 内部自动绑定
     *
     * @param event - 事件名称
     * @param data - 事件数据载荷
     * @param options - 可选配置：
     *   - source: 事件源标识（如 eventKey、'router'），桥接的关键
     *   - domEvent: 原始 DOM 事件（可选）
     */
    emit(event: string, data?: any, options?: { source?: any; domEvent?: Event }) {
        if (options && options.source !== undefined) {
            // UI 事件模式：自动构建 EventContext
            this._emitWithContext(event, data, options);
        } else {
            // 传统模式：直接走 eventScope
            this.eventScope.emit(event, data);
        }
    },

    // ============================================
    // UI 事件扩展（内部方法）
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
     * UI 事件模式：构建 EventContext 并通过 eventScope 发布
     *
     * 框架自动处理：
     * 1. 构建 EventContext（自动填充 event/type/source/sourceType/scopeId）
     * 2. 深拷贝 data（脱离原始引用）
     * 3. 自动构建 chain（从 _currentEventContext 继承事件链路）
     * 4. scopeId 由 eventScope 内部自动绑定
     * 5. 引用计数管理（EventBus.emit 中处理）
     *
     * @param event - 事件类型（如 selectionChange）
     * @param data - 事件数据载荷
     * @param options - 配置：source/domEvent
     */
    _emitWithContext(event: string, data?: any, options?: { source?: any; domEvent?: Event }) {
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

        // 4. 确定 source（scopeId 由 eventScope 内部自动绑定）
        const source = options?.source ?? (eventKey ?? '');

        // 5. 构建 EventContext
        const ctx = EventContextBuilder.create()
            .withEvent(fullEvent)
            .withType(event)
            .withSource(source)
            .withSourceType(this.constructor.name)
            .withData(clonedData)
            .withBusId(globalEventBus.getBusId())
            .withScopeId(this.eventScope.getScopeId())
            .withChain(chain)
            .build();

        if (options?.domEvent) {
            ctx.domEvent = options.domEvent;
        }

        // 6. 通过 eventScope 发布（传入预构建的 EventContext，scopeId 内部自动绑定）
        this.eventScope.emit(fullEvent, ctx);
    },

    /**
     * 在 handler 执行期间设置当前事件上下文
     *
     * 用于 bindStateTrigger 中，确保 emit 能正确构建 chain。
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
