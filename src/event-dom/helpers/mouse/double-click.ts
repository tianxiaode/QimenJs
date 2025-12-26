/**
 * 监听元素双击事件
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 双击时的回调函数
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const image = document.getElementById('previewImage');
 * 
 * bindDoubleClick(scope, image, (event) => {
 *   console.log('图片被双击');
 *   toggleFullscreen();
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export interface DoubleClickOptions {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    capture?: boolean;
    delay?: number;  // 双击判定时间（毫秒），默认为 300ms
}

export function bindDoubleClick(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent) => void,
    options: DoubleClickOptions = {}
) {
    const {
        preventDefault = false,
        stopPropagation = false,
        capture = false,
        delay = 300
    } = options;

    let clickCount = 0;
    let timer: number | null = null;

    const listener = (event: MouseEvent) => {
        // 只处理左键
        if (event.button !== 0) return;
        
        clickCount++;
        
        if (clickCount === 1) {
            // 第一次点击，启动定时器
            timer = window.setTimeout(() => {
                clickCount = 0;
                timer = null;
            }, delay);
        } else if (clickCount === 2) {
            // 第二次点击，执行双击逻辑
            if (preventDefault) {
                event.preventDefault();
            }
            
            if (stopPropagation) {
                event.stopPropagation();
            }
            
            handler(event);
            
            // 重置
            if (timer) {
                clearTimeout(timer);
            }
            clickCount = 0;
            timer = null;
        }
    };

    target.addEventListener("click", listener, capture);
    
    scope.addCleanup(() => {
        target.removeEventListener("click", listener, capture);
        if (timer) {
            clearTimeout(timer);
        }
    });
}