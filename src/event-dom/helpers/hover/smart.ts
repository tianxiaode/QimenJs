/**
 * 智能悬停 - 支持延迟、防抖动和子元素处理
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handlers - 悬停处理器
 * @param options - 配置选项
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const dropdown = document.getElementById('dropdown');
 * 
 * bindSmartHover(scope, dropdown, {
 *   onEnter: () => {
 *     console.log('显示下拉菜单');
 *     dropdown.classList.add('open');
 *   },
 *   onLeave: () => {
 *     console.log('隐藏下拉菜单');
 *     dropdown.classList.remove('open');
 *   }
 * }, {
 *   enterDelay: 200,
 *   leaveDelay: 300,
 *   ignoreChildren: '.dropdown-content' // 悬停到内容时不触发离开
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export interface SmartHoverHandlers {
    onEnter: (event: MouseEvent) => void;
    onLeave: (event: MouseEvent) => void;
}

export interface SmartHoverOptions {
    enterDelay?: number;      // 进入延迟
    leaveDelay?: number;      // 离开延迟
    ignoreChildren?: string;  // 忽略的子元素选择器
}

export function bindSmartHover(
    scope: EventScope<any>,
    target: HTMLElement,
    handlers: SmartHoverHandlers,
    options: SmartHoverOptions = {}
) {
    const { enterDelay = 0, leaveDelay = 0, ignoreChildren } = options;
    let enterTimer: number | null = null;
    let leaveTimer: number | null = null;
    let isHovering = false;

    const checkShouldIgnore = (element: HTMLElement): boolean => {
        if (!ignoreChildren) return false;
        return element.matches(ignoreChildren) || 
               element.closest(ignoreChildren) !== null;
    };

    // 鼠标进入
    const enterListener = (event: MouseEvent) => {
        const targetElement = event.target as HTMLElement;
        
        // 检查是否应该忽略
        if (ignoreChildren && checkShouldIgnore(targetElement)) {
            return;
        }

        if (isHovering) return;
        
        if (enterTimer) {
            clearTimeout(enterTimer);
        }
        
        if (leaveTimer) {
            clearTimeout(leaveTimer);
            leaveTimer = null;
        }

        if (enterDelay > 0) {
            enterTimer = window.setTimeout(() => {
                isHovering = true;
                handlers.onEnter(event);
            }, enterDelay);
        } else {
            isHovering = true;
            handlers.onEnter(event);
        }
    };

    // 鼠标离开
    const leaveListener = (event: MouseEvent) => {
        const relatedTarget = event.relatedTarget as HTMLElement;
        
        // 检查鼠标是否移到了应该忽略的子元素上
        if (relatedTarget && target.contains(relatedTarget)) {
            if (ignoreChildren && checkShouldIgnore(relatedTarget)) {
                return;
            }
        }

        if (!isHovering) return;
        
        if (leaveTimer) {
            clearTimeout(leaveTimer);
        }
        
        if (enterTimer) {
            clearTimeout(enterTimer);
            enterTimer = null;
        }

        const executeLeave = () => {
            isHovering = false;
            handlers.onLeave(event);
        };

        if (leaveDelay > 0) {
            leaveTimer = window.setTimeout(executeLeave, leaveDelay);
        } else {
            executeLeave();
        }
    };

    target.addEventListener("mouseenter", enterListener);
    target.addEventListener("mouseleave", leaveListener);
    
    scope.addCleanup(() => {
        target.removeEventListener("mouseenter", enterListener);
        target.removeEventListener("mouseleave", leaveListener);
        if (enterTimer) clearTimeout(enterTimer);
        if (leaveTimer) clearTimeout(leaveTimer);
    });
}