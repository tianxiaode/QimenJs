/**
 * 监听右键菜单事件
 * 可用于自定义右键菜单或阻止默认菜单
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 右键菜单时的回调函数
 * @param preventDefault - 是否阻止默认右键菜单，默认为 true
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const canvas = document.getElementById('myCanvas');
 * 
 * bindContextMenu(scope, canvas, (event) => {
 *   console.log('右键点击', { x: event.clientX, y: event.clientY });
 *   // 显示自定义右键菜单
 *   showCustomContextMenu(event.clientX, event.clientY);
 * });
 * 
 * // 在某些元素上允许默认右键菜单
 * const textArea = document.getElementById('myTextArea');
 * bindContextMenu(scope, textArea, (event) => {
 *   console.log('文本区域右键点击');
 * }, false); // 不阻止默认菜单
 * ```
 */
import { EventScope } from "@/event";

export function bindContextMenu(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent) => void,
    preventDefault = true
) {
    const listener = (event: MouseEvent) => {
        if (preventDefault) {
            event.preventDefault();
        }
        handler(event);
    };

    target.addEventListener("contextmenu", listener);
    
    scope.addCleanup(() => {
        target.removeEventListener("contextmenu", listener);
    });
}