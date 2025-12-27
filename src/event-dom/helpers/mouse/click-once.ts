/**
 * 监听一次性点击事件，执行后自动移除监听器
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 点击时的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const acceptButton = document.getElementById('acceptTerms');
 * 
 * bindClickOnce(scope, acceptButton, (event) => {
 *   console.log('条款已接受，按钮将禁用');
 *   acceptButton.disabled = true;
 *   acceptButton.textContent = '已接受';
 * });
 * ```
 */
import { EventScope } from "@/event";
import { ClickOptions } from "./types";
import { bindClick } from "./click";

export function bindClickOnce(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent) => void,
    options: Omit<ClickOptions, 'once'> = {}
) {
    return bindClick(scope, target, handler, { ...options, once: true });
}