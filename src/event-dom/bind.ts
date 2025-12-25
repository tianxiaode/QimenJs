/**
 * 绑定 DOM 事件到 EventScope，自动处理事件监听和销毁
 * 
 * @param scope - 事件作用域，用于管理事件生命周期
 * @param target - 事件目标对象，可以是任何 EventTarget
 * @param type - 事件类型，例如 'click', 'mouseover' 等
 * @param handler - 事件处理函数
 * @param options - 事件监听器选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const button = document.getElementById('myButton');
 * 
 * bindDomEvent(scope, button, 'click', (event) => {
 *   console.log('按钮被点击了', event);
 * });
 * 
 * // 当 scope 销毁时，会自动移除事件监听器
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindDomEvent<
    T extends EventTarget,
    K extends keyof HTMLElementEventMap
>(
    scope: EventScope<any>,
    target: T,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
): void {
    const listener = handler as EventListener;

    target.addEventListener(type as string, listener, options);

    // 使用 addCleanup 方法添加清理函数
    scope.addCleanup(() => {
        target.removeEventListener(type as string, listener, options);
    });
}