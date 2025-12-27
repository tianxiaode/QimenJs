/**
 * 监听长按事件（适用于触摸和鼠标）
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 长按时的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const deleteButton = document.getElementById('deleteBtn');
 * 
 * bindLongPress(scope, deleteButton, (event) => {
 *   console.log('长按删除按钮');
 *   showDeleteConfirmation();
 * }, { duration: 1000, feedback: true });
 * ```
 */
import { EventScope } from "@/event";

export interface LongPressOptions {
    duration?: number;     // 长按持续时间（毫秒），默认为 500ms
    feedback?: boolean;    // 是否提供触觉反馈
    preventDefault?: boolean; // 是否阻止默认行为
}

export function bindLongPress(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent | TouchEvent) => void,
    options: LongPressOptions = {}
) {
    const { duration = 500, feedback = false, preventDefault = true } = options;
    let pressTimer: number | null = null;
    let startEvent: MouseEvent | TouchEvent | null = null;

    const startPress = (event: MouseEvent | TouchEvent) => {
        if (preventDefault) {
            event.preventDefault();
        }
        
        startEvent = event;
        
        pressTimer = window.setTimeout(() => {
            // 提供触觉反馈
            if (feedback && 'vibrate' in navigator) {
                (navigator as any).vibrate(50);
            }
            
            // 视觉反馈
            target.classList.add('long-press-active');
            
            handler(event);
            
            // 移除视觉反馈
            setTimeout(() => {
                target.classList.remove('long-press-active');
            }, 200);
        }, duration);
    };

    const endPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        target.classList.remove('long-press-active');
    };

    // 鼠标事件
    const mouseDownListener = (event: MouseEvent) => {
        // 只响应左键
        if (event.button === 0) {
            startPress(event);
        }
    };

    const mouseUpListener = () => endPress();
    const mouseLeaveListener = () => endPress();

    // 触摸事件
    const touchStartListener = (event: TouchEvent) => {
        startPress(event);
    };

    const touchEndListener = () => endPress();
    const touchCancelListener = () => endPress();

    // 绑定鼠标事件
    target.addEventListener("mousedown", mouseDownListener);
    target.addEventListener("mouseup", mouseUpListener);
    target.addEventListener("mouseleave", mouseLeaveListener);
    
    // 绑定触摸事件
    target.addEventListener("touchstart", touchStartListener);
    target.addEventListener("touchend", touchEndListener);
    target.addEventListener("touchcancel", touchCancelListener);
    
    scope.addCleanup(() => {
        // 清理鼠标事件
        target.removeEventListener("mousedown", mouseDownListener);
        target.removeEventListener("mouseup", mouseUpListener);
        target.removeEventListener("mouseleave", mouseLeaveListener);
        
        // 清理触摸事件
        target.removeEventListener("touchstart", touchStartListener);
        target.removeEventListener("touchend", touchEndListener);
        target.removeEventListener("touchcancel", touchCancelListener);
        
        if (pressTimer) clearTimeout(pressTimer);
    });
}