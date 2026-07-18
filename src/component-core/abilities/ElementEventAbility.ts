/**
 * ElementEventAbility 元素事件绑定能力
 *
 * 从组件 eventMap 中读取事件声明，通过 this.bind 统一绑定 DOM 事件。
 * 使用 event-dom 的事件规范命名（GestureSemantic / InputSignal），
 * 跨平台兼容（pointer/touch/mouse 自动适配）。
 *
 * 内部事件（data-event="click"）：
 * - 方法名从 data-content 自动推导：单 group → onName，多 group → onGroupName
 * - 通过 this.bind 绑定，this.on 监听分发到实例方法
 * - 支持 ?once（只触发一次）、?delegate（事件委托）修饰符
 *
 * 外部事件（data-emit="click"）：
 * - data-emit 声明即生效，通过 this.bind 绑定，this.on 监听后 emitUI 发布
 * - bridges 配置：声明走事件桥发布的事件
 * - handlers 配置：绑定具体函数
 *
 * 事件规范命名（推荐）：
 * - 点击：tap（轻触）/ click（点击）/ dblclick（双击）
 * - 长按：longpress
 * - 滑动：swipe / swipeleft / swiperight / swipeup / swipedown
 * - 拖拽：drag
 * - 悬停：hover
 * - 输入：input / change / focus / blur / submit
 * - 滚动：scroll
 * - 键盘：keydown / keyup
 *
 * @example
 * ```html
 * <!-- 内部事件：使用规范命名 -->
 * <input data-content="input:field" data-event="input" />
 *   → 方法名 onField
 *
 * <button data-content="dialog:close" data-event="tap?once" />
 *   → 方法名 onDialogClose
 *
 * <!-- 外部事件：声明即发布 -->
 * <button data-content="page:saveBtn" data-emit="tap" />
 *   → emitUI('saveBtn:tap', data)
 *
 * <!-- 事件委托 -->
 * <div data-content="actions:list" data-event="tap?delegate" data-target=".list-item">
 *     <div class="list-item">Item 1</div>
 * </div>
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { InternalEventBinding, EventMap } from '../types/index';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export const ElementEventAbility: AbilityDefinition = {
    /**
     * 从 eventMap 读取事件声明，通过 this.bind 统一绑定 DOM 事件
     */
    __initProps(): void {
        const eventMap: EventMap = this.eventMap;
        if (!eventMap) return;

        // ─── 绑定内部事件 ───
        for (const binding of eventMap.internal) {
            const { event, handler, once, delegate, delegateTarget, node } = binding;
            // DOM 事件加前缀，避免与组件 emit 的同名事件冲突
            const domEvent = `${DOM_EVENT_PREFIX}${event}`;

            if (delegate) {
                // 事件委托模式：bind 绑定 + on 监听 + closest 委托
                this.bind(node.el, event as any, { selector: delegateTarget });
                this.on(domEvent, (gesture: any) => {
                    const domEvt = gesture?.domEvent ?? gesture;
                    const target = delegateTarget
                        ? (domEvt.target as HTMLElement).closest(delegateTarget)
                        : (domEvt.target as HTMLElement);
                    if (target) {
                        (this as any)[handler](domEvt, target);
                    }
                });
            } else if (once) {
                // 只触发一次：bind 绑定 + once 监听
                this.bind(node.el, event as any);
                this.once(domEvent, (gesture: any) => {
                    const domEvt = gesture?.domEvent ?? gesture;
                    (this as any)[handler](domEvt, node.el);
                });
            } else {
                // 常规绑定：bind 绑定 + on 监听
                this.bind(node.el, event as any);
                this.on(domEvent, (gesture: any) => {
                    const domEvt = gesture?.domEvent ?? gesture;
                    (this as any)[handler](domEvt, node.el);
                });
            }
        }

        // ─── 绑定外部事件：data-emit 声明即生效，走事件桥 emit ───
        for (const [emitKey, node] of Object.entries(eventMap.external) as [string, any][]) {
            // emitKey 格式为 "name:event"，取事件类型
            const eventType = emitKey.split(':')[1] || emitKey;
            // DOM 事件加前缀
            const domEventType = `${DOM_EVENT_PREFIX}${eventType}`;

            this.bind(node.el, eventType as any);
            this.on(domEventType, (gesture: any) => {
                const domEvt = gesture?.domEvent ?? gesture;
                if (typeof this.emit === 'function') {
                    this.emit(eventType, undefined, { domEvent: domEvt });
                }
            });
        }
    },
};
