/**
 * 监听点击元素外部的事件
 * 当用户点击目标元素以外的区域时触发回调函数
 * 
 * @param scope - 事件作用域，用于管理事件生命周期
 * @param target - 目标元素，当点击该元素外部时触发回调
 * @param handler - 点击元素外部时执行的回调函数
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const myDiv = document.getElementById('myDiv');
 * 
 * bindClickOutside(scope, myDiv, (event) => {
 *   console.log('点击了元素外部', event);
 *   // 可以用来关闭下拉菜单、弹窗等
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindClickOutside(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (e: MouseEvent) => void
) {
    const listener = (e: MouseEvent) => {
        if (!target.contains(e.target as Node)) {
            handler(e);
        }
    };

    document.addEventListener("mousedown", listener);

    // 使用 addCleanup 方法添加清理函数
    scope.addCleanup(() => {
        document.removeEventListener("mousedown", listener);
    });
}