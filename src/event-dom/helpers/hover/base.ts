/**
 * 监听鼠标悬停事件（mouseenter/mouseleave）
 * 推荐使用 mouseenter/mouseleave 而不是 mouseover/mouseout
 * 因为前者不会冒泡，更适合悬停效果
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handlers - 包含进入和离开的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const button = document.getElementById('myButton');
 * 
 * bindHover(scope, button, {
 *   onEnter: () => {
 *     console.log('鼠标进入');
 *     button.style.backgroundColor = '#f0f0f0';
 *   },
 *   onLeave: () => {
 *     console.log('鼠标离开');
 *     button.style.backgroundColor = '';
 *   }
 * }, { delay: 100 });
 * ```
 */
import { EventScope } from "@/event";

export interface HoverHandlers {
    onEnter?: (event: MouseEvent) => void;
    onLeave?: (event: MouseEvent) => void;
}

export interface HoverOptions {
    delay?: number;    // 延迟触发进入效果（毫秒）
    timeout?: number;  // 延迟触发离开效果（毫秒）
}

export function bindHover(
    scope: EventScope<any>,
    target: HTMLElement,
    handlers: HoverHandlers,
    options: HoverOptions = {}
) {
    const { delay = 0, timeout = 0 } = options;
    let enterTimer: number | null = null;
    let leaveTimer: number | null = null;
    let isHovering = false;

    // 鼠标进入
    if (handlers.onEnter) {
        const enterListener = (event: MouseEvent) => {
            if (isHovering) return;
            
            if (enterTimer) {
                clearTimeout(enterTimer);
            }
            
            if (delay > 0) {
                enterTimer = window.setTimeout(() => {
                    isHovering = true;
                    handlers.onEnter!(event);
                }, delay);
            } else {
                isHovering = true;
                handlers.onEnter!(event);
            }

            // 清理离开定时器
            if (leaveTimer) {
                clearTimeout(leaveTimer);
                leaveTimer = null;
            }
        };

        target.addEventListener("mouseenter", enterListener);
        scope.addCleanup(() => {
            target.removeEventListener("mouseenter", enterListener);
            if (enterTimer) clearTimeout(enterTimer);
        });
    }

    // 鼠标离开
    if (handlers.onLeave) {
        const leaveListener = (event: MouseEvent) => {
            if (!isHovering) return;
            
            if (leaveTimer) {
                clearTimeout(leaveTimer);
            }
            
            const executeLeave = () => {
                isHovering = false;
                handlers.onLeave!(event);
            };

            if (timeout > 0) {
                leaveTimer = window.setTimeout(executeLeave, timeout);
            } else {
                executeLeave();
            }

            // 清理进入定时器
            if (enterTimer) {
                clearTimeout(enterTimer);
                enterTimer = null;
            }
        };

        target.addEventListener("mouseleave", leaveListener);
        scope.addCleanup(() => {
            target.removeEventListener("mouseleave", leaveListener);
            if (leaveTimer) clearTimeout(leaveTimer);
        });
    }
}