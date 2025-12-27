/**
 * 阻止元素的默认点击行为
 * 常用于阻止链接跳转或表单提交
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 自定义处理函数（可选）
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const link = document.getElementById('preventLink');
 * 
 * bindPreventDefaultClick(scope, link, (event) => {
 *   console.log('链接点击被阻止，执行自定义导航');
 *   navigateTo('/custom-page');
 * });
 * ```
 */
import { EventScope } from "@/event";

export function bindPreventDefaultClick(
    scope: EventScope<any>,
    target: HTMLElement,
    handler?: (event: MouseEvent) => void
) {
    const listener = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (handler) {
            handler(event);
        }
    };

    target.addEventListener("click", listener);
    
    scope.addCleanup(() => {
        target.removeEventListener("click", listener);
    });
}