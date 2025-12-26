/**
 * 监听点击并按住事件
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handlers - 包含按下、按住和释放的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const slider = document.getElementById('volumeSlider');
 * 
 * bindClickAndHold(scope, slider, {
 *   onStart: (event) => {
 *     console.log('开始拖动');
 *     slider.classList.add('dragging');
 *   },
 *   onHold: (event, duration) => {
 *     console.log(`按住 ${duration}ms`);
 *     updateVolume(event.clientX);
 *   },
 *   onEnd: (event, totalDuration) => {
 *     console.log(`释放，总时长 ${totalDuration}ms`);
 *     slider.classList.remove('dragging');
 *   }
 * }, { holdThreshold: 200 });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export interface ClickAndHoldHandlers {
    onStart?: (event: MouseEvent) => void;          // 按下时
    onHold?: (event: MouseEvent, duration: number) => void; // 按住时（持续触发）
    onEnd?: (event: MouseEvent, totalDuration: number) => void; // 释放时
}

export interface ClickAndHoldOptions {
    holdThreshold?: number;  // 按住判定阈值（毫秒），默认 100ms
    interval?: number;       // onHold 触发间隔（毫秒），默认 16ms（约60fps）
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

export function bindClickAndHold(
    scope: EventScope<any>,
    target: HTMLElement,
    handlers: ClickAndHoldHandlers,
    options: ClickAndHoldOptions = {}
) {
    const {
        holdThreshold = 100,
        interval = 16,
        preventDefault = false,
        stopPropagation = false
    } = options;

    let holdTimer: number | null = null;
    let intervalTimer: number | null = null;
    let startTime = 0;
    let isHolding = false;
    let startEvent: MouseEvent | null = null;

    const mouseDownListener = (event: MouseEvent) => {
        // 只处理左键
        if (event.button !== 0) return;
        
        if (preventDefault) {
            event.preventDefault();
        }
        
        if (stopPropagation) {
            event.stopPropagation();
        }
        
        startEvent = event;
        startTime = Date.now();
        isHolding = true;
        
        // 触发按下事件
        if (handlers.onStart) {
            handlers.onStart(event);
        }
        
        // 设置按住定时器
        holdTimer = window.setTimeout(() => {
            // 达到按住阈值，开始持续触发 onHold
            if (isHolding && handlers.onHold) {
                // 立即触发一次
                handlers.onHold(event, Date.now() - startTime);
                
                // 设置间隔触发
                intervalTimer = window.setInterval(() => {
                    if (isHolding && handlers.onHold && startEvent) {
                        handlers.onHold(startEvent, Date.now() - startTime);
                    }
                }, interval);
            }
        }, holdThreshold);
    };

    const mouseUpListener = (event: MouseEvent) => {
        if (event.button !== 0) return;
        
        const totalDuration = Date.now() - startTime;
        
        // 清理定时器
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        
        if (intervalTimer) {
            clearInterval(intervalTimer);
            intervalTimer = null;
        }
        
        // 如果处于按住状态，触发结束事件
        if (isHolding) {
            if (handlers.onEnd) {
                handlers.onEnd(event, totalDuration);
            }
        }
        
        isHolding = false;
        startEvent = null;
    };

    const mouseLeaveListener = () => {
        // 鼠标离开元素时也结束
        if (isHolding) {
            const totalDuration = Date.now() - startTime;
            
            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
            
            if (intervalTimer) {
                clearInterval(intervalTimer);
                intervalTimer = null;
            }
            
            if (handlers.onEnd && startEvent) {
                handlers.onEnd(startEvent, totalDuration);
            }
            
            isHolding = false;
            startEvent = null;
        }
    };

    target.addEventListener("mousedown", mouseDownListener);
    target.addEventListener("mouseup", mouseUpListener);
    target.addEventListener("mouseleave", mouseLeaveListener);
    
    scope.addCleanup(() => {
        target.removeEventListener("mousedown", mouseDownListener);
        target.removeEventListener("mouseup", mouseUpListener);
        target.removeEventListener("mouseleave", mouseLeaveListener);
        
        if (holdTimer) clearTimeout(holdTimer);
        if (intervalTimer) clearInterval(intervalTimer);
    });
}