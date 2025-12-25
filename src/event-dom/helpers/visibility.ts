/**
 * 监听页面可见性变化事件，当页面在前台和后台之间切换时触发回调
 * 
 * @param scope - 事件作用域，用于管理事件生命周期
 * @param handler - 页面可见性变化时执行的回调函数，参数为可见性状态
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * 
 * bindVisibilityChange(scope, (visible) => {
 *   if (visible) {
 *     console.log('页面变为可见');
 *     // 可以在这里恢复定时器、网络请求等
 *   } else {
 *     console.log('页面变为不可见');
 *     // 可以在这里暂停定时器、网络请求等
 *   }
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindVisibilityChange(
    scope: EventScope<any>,
    handler: (visible: boolean) => void
) {
    const listener = () => {
        handler(!document.hidden);
    };

    document.addEventListener("visibilitychange", listener);

    // 使用 addCleanup 方法添加清理函数
    scope.addCleanup(() => {
        document.removeEventListener("visibilitychange", listener);
    });
}