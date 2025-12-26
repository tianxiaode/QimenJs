/**
 * 监听元素点击事件
 * 支持单次点击、双击和自定义点击行为
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 点击时的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const button = document.getElementById('myButton');
 * 
 * bindClick(scope, button, (event) => {
 *   console.log('按钮被点击');
 *   submitForm();
 * });
 * 
 * // 阻止默认行为
 * bindClick(scope, link, (event) => {
 *   event.preventDefault();
 *   navigateProgrammatically();
 * }, { preventDefault: true });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";
import { ClickOptions } from "./types";

export function bindClick(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent) => void,
    options: ClickOptions = {}
) {
    const {
        preventDefault = false,
        stopPropagation = false,
        capture = false,
        once = false
    } = options;

    const listener = (event: MouseEvent) => {
        // 只处理左键点击
        if (event.button !== 0) return;
        
        if (preventDefault) {
            event.preventDefault();
        }
        
        if (stopPropagation) {
            event.stopPropagation();
        }
        
        handler(event);
        
        // 如果是一次性的，移除监听器
        if (once) {
            target.removeEventListener("click", listener, capture);
        }
    };

    target.addEventListener("click", listener, capture);
    
    scope.addCleanup(() => {
        target.removeEventListener("click", listener, capture);
    });
}