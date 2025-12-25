/**
 * 将 DOM 事件桥接到 EventBus，实现 DOM 事件与自定义事件之间的映射
 * 
 * @param scope - 事件作用域，用于管理事件生命周期
 * @param bus - 事件总线，用于触发自定义事件
 * @param target - DOM 事件目标对象
 * @param domEvent - DOM 事件类型，例如 'click', 'mouseover' 等
 * @param busEvent - EventBus 中对应的事件名称
 * @param options - 事件监听器选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const bus = new EventBus();
 * const button = document.getElementById('myButton');
 * 
 * bridgeDomEvent(
 *   scope,
 *   bus,
 *   button,
 *   'click',
 *   'button:clicked',
 *   (event) => {
 *     console.log('按钮被点击了', event);
 *   }
 * );
 * 
 * bus.on('button:clicked', (event) => {
 *   console.log('收到按钮点击事件', event);
 * });
 * ```
 */
import { EventBus, EventScope } from '@orbitjs/event-core';

export function bridgeDomEvent<
    Events extends Record<string, any>,
    K extends keyof HTMLElementEventMap,
    E extends keyof Events
>(
    scope: EventScope<Events>,
    bus: EventBus<Events>,
    target: EventTarget,
    domEvent: K,
    busEvent: E,
    options?: AddEventListenerOptions
): void {
    const listener: EventListener = (evt) => {
        bus.emit(busEvent, evt as Events[E]);
    };

    target.addEventListener(domEvent as string, listener, options);

    // 使用 addCleanup 方法添加清理函数
    scope.addCleanup(() => {
        target.removeEventListener(domEvent as string, listener, options);
    });
}