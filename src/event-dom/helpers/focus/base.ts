/**
 * 监听元素获得焦点事件
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 获得焦点时的回调函数
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const input = document.getElementById('myInput');
 * 
 * bindFocus(scope, input, (e) => {
 *   console.log('输入框获得焦点');
 *   input.style.borderColor = 'blue';
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindFocus(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (e: FocusEvent) => void
) {
    const listener = (e: FocusEvent) => handler(e);
    target.addEventListener("focus", listener);
    
    scope.addCleanup(() => {
        target.removeEventListener("focus", listener);
    });
}