/**
 * 监听点击元素外部的事件（增强版）
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 点击外部时的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const modal = document.getElementById('myModal');
 * 
 * bindClickOutside(scope, modal, (event) => {
 *   console.log('点击了模态框外部');
 *   closeModal();
 * }, { exclude: ['.modal-content', '.modal-footer'] });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";
import { ClickOutsideOptions } from "./types";


export function bindClickOutside(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (e: MouseEvent) => void,
    options: ClickOutsideOptions = {}
) {
    const { exclude = [], capture = false } = options;

    const listener = (e: MouseEvent) => {
        const clickedElement = e.target as HTMLElement;
        
        // 检查是否点击了目标元素内部
        if (target.contains(clickedElement)) {
            return;
        }
        
        // 检查是否点击了排除的元素
        if (exclude.some(selector => {
            return clickedElement.matches(selector) || 
                   clickedElement.closest(selector) !== null;
        })) {
            return;
        }
        
        handler(e);
    };

    document.addEventListener("mousedown", listener, capture);

    scope.addCleanup(() => {
        document.removeEventListener("mousedown", listener, capture);
    });
}