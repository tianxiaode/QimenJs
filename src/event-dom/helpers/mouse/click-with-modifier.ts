/**
 * 监听带修饰键的点击事件（Ctrl、Shift、Alt、Meta）
 * 
 * @param scope - 事件作用域
 * @param target - 目标元素
 * @param handler - 点击时的回调函数
 * @param modifiers - 修饰键配置
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const item = document.getElementById('listItem');
 * 
 * // Ctrl+点击，多选
 * bindClickWithModifier(scope, item, (event) => {
 *   console.log('Ctrl+点击，添加到选择');
 *   addToSelection(item);
 * }, { ctrl: true });
 * 
 * // Shift+点击，范围选择
 * bindClickWithModifier(scope, item, (event) => {
 *   console.log('Shift+点击，选择范围');
 *   selectRange(item);
 * }, { shift: true });
 * ```
 */
import { EventScope } from "@/event";
import { ClickOptions } from "./types";
import { bindClick } from "./click";

export interface ClickModifiers {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

export function bindClickWithModifier(
    scope: EventScope<any>,
    target: HTMLElement,
    handler: (event: MouseEvent) => void,
    modifiers: ClickModifiers,
    options: Omit<ClickOptions, 'preventDefault' | 'stopPropagation'> = {}
) {
    const listener = (event: MouseEvent) => {
        // 检查修饰键
        if (
            (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) ||
            (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) ||
            (modifiers.alt !== undefined && event.altKey !== modifiers.alt) ||
            (modifiers.meta !== undefined && event.metaKey !== modifiers.meta)
        ) {
            return;
        }
        
        // 只处理左键
        if (event.button !== 0) return;
        
        handler(event);
    };

    bindClick(scope, target, listener, options);
}