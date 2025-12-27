/**
 * 监听窗口大小调整事件，自动节流处理以提高性能
 * 
 * @param scope - 事件作用域，用于管理事件生命周期
 * @param handler - 窗口大小调整时执行的回调函数
 * @param wait - 节流等待时间（毫秒），默认为 100ms
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * 
 * bindResize(scope, () => {
 *   console.log('窗口大小已调整', {
 *     width: window.innerWidth,
 *     height: window.innerHeight
 *   });
 * }, 150); // 150ms 节流
 * ```
 */
import { EventScope } from "@/event";
import { throttle } from "@orbitjs/async";

export function bindResize(
    scope: EventScope<any>,
    handler: (event: Event) => void,
    wait = 100
) {
    const fn = throttle(handler, wait);

    window.addEventListener("resize", fn);

    // 使用 addCleanup 方法添加清理函数
    scope.addCleanup(() => {
        window.removeEventListener("resize", fn);
    });
}