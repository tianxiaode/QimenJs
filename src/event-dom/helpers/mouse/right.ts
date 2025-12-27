/**
 * 监听右键点击事件（mousedown）
 * 与 contextmenu 不同，这是在右键按下时触发
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 右键点击时的回调函数
 * @param preventDefault - 是否阻止默认行为，默认为 true
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const gameElement = document.getElementById('gameCanvas');
 * 
 * bindRightClick(scope, gameElement, (event) => {
 *   console.log('游戏对象右键点击');
 *   // 在游戏中执行特殊动作
 *   performSpecialAction(event.clientX, event.clientY);
 * });
 * ```
 */
import { EventScope } from "@/event";

export function bindRightClick(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent) => void,
    preventDefault = true
) {
    const listener = (event: MouseEvent) => {
        // 检查是否是右键（button === 2 是右键）
        if (event.button === 2) {
            if (preventDefault) {
                event.preventDefault();
            }
            handler(event);
        }
    };

    target.addEventListener("mousedown", listener);
    
    scope.addCleanup(() => {
        target.removeEventListener("mousedown", listener);
    });
}