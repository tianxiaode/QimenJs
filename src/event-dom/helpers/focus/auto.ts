/**
 * 自动将焦点设置到元素上
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param delay - 延迟时间（毫秒），默认为0
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const searchInput = document.getElementById('search');
 * 
 * bindAutoFocus(scope, searchInput, 100);
 * // 页面加载100ms后自动聚焦到搜索框
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindAutoFocus(
    scope: EventScope<any>,
    target: HTMLElement,
    delay = 0
) {
    const timeoutId = setTimeout(() => {
        if (document.body.contains(target)) {
            target.focus();
        }
    }, delay);
    
    scope.addCleanup(() => {
        clearTimeout(timeoutId);
    });
}