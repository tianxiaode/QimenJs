/**
 * ElementEventAbility 元素事件绑定能力
 *
 * 从组件 eventMap 中读取事件声明，自动绑定 DOM 事件。
 * 消除组件构造函数中重复的 querySelector + addEventListener 模式。
 *
 * 内部事件（data-event="click"）：
 * - 方法名从 data-content 自动推导：单 group → onName，多 group → onGroupName
 * - 用闭包包装调用 this[handler](event, el)，不主动抛错
 * - JS 执行时方法不存在自然报错
 * - 支持 ?once（只触发一次）、?delegate（事件委托）修饰符
 *
 * 外部事件（data-emit="click"）：
 * - 自动 addEventListener，触发时 this.emit('group:event', event)
 * - 与 EventBridge/handlers 结合，有定义就绑定，没有就不处理
 *
 * @example
 * ```html
 * <!-- 内部事件：方法名从 data-content 推导 -->
 * <input data-content="input:field" data-event="input" />
 *   → 方法名 onField（单 group）或 onInputField（多 group）
 *
 * <button data-content="dialog:close" data-event="click?once" />
 *   → 方法名 onDialogClose
 *
 * <!-- 外部事件 -->
 * <div data-content="header:title" data-emit="click" />
 *   → emit('header:click', event)
 *
 * <!-- 事件委托 -->
 * <div data-content="actions:list" data-event="click?delegate" data-target=".list-item">
 *     <div class="list-item">Item 1</div>
 * </div>
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { InternalEventBinding, EventMap } from '@qimenjs/component-core';

export const ElementEventAbility: AbilityDefinition = {
    /**
     * 从 eventMap 读取事件声明，自动绑定 DOM 事件
     */
    __initProps(): void {
        const eventMap: EventMap = this.eventMap;
        if (!eventMap) return;

        // ─── 绑定内部事件 ───
        for (const binding of eventMap.internal) {
            const { event, handler, once, delegate, delegateTarget, node } = binding;

            // 闭包包装：不主动抛错，JS 执行时方法不存在自然报错
            if (delegate) {
                // 事件委托模式
                const delegateHandler = (ev: Event) => {
                    const target = (ev.target as HTMLElement).closest(delegateTarget || '*');
                    if (target) {
                        (this as any)[handler](ev, target);
                    }
                };
                node.el.addEventListener(event, delegateHandler);
                this.onCleanup(() => node.el.removeEventListener(event, delegateHandler));
            } else if (once) {
                // 只触发一次
                const boundHandler = (ev: Event) => (this as any)[handler](ev, node.el);
                node.el.addEventListener(event, boundHandler, { once: true });
            } else {
                // 常规绑定
                const boundHandler = (ev: Event) => (this as any)[handler](ev, node.el);
                node.el.addEventListener(event, boundHandler);
                this.onCleanup(() => node.el.removeEventListener(event, boundHandler));
            }
        }

        // ─── 绑定外部事件 ───
        for (const [emitKey, node] of Object.entries(eventMap.external)) {
            // emitKey 格式为 "group:event"，取事件类型
            const eventType = emitKey.split(':')[1] || emitKey;
            const handler = (ev: Event) => {
                if (typeof this.emit === 'function') {
                    this.emit(emitKey, ev);
                }
            };
            node.el.addEventListener(eventType, handler);
            this.onCleanup(() => node.el.removeEventListener(eventType, handler));
        }
    },
};
