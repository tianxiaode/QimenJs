/**
 * 监听元素失去焦点事件
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 失去焦点时的回调函数
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const input = document.getElementById('myInput');
 * 
 * bindBlur(scope, input, (e) => {
 *   console.log('输入框失去焦点');
 *   // 验证输入
 *   if (!input.value) {
 *     input.style.borderColor = 'red';
 *   }
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindBlur(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (e: FocusEvent) => void
) {
    const listener = (e: FocusEvent) => handler(e);
    target.addEventListener("blur", listener);
    
    scope.addCleanup(() => {
        target.removeEventListener("blur", listener);
    });
}