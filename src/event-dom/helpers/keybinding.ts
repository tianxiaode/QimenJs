/**
 * 键盘绑定选项接口，用于定义修饰键的组合
 */
export interface KeyBindingOptions {
    /** 是否需要 Ctrl 键被按下 */
    ctrl?: boolean;
    /** 是否需要 Shift 键被按下 */
    shift?: boolean;
    /** 是否需要 Alt 键被按下 */
    alt?: boolean;
    /** 是否需要 Meta 键被按下 (如 Windows 键或 Cmd 键) */
    meta?: boolean;
}

/**
 * 绑定键盘按键事件，当按下指定键并满足修饰键条件时触发回调
 * 
 * @param scope - 事件作用域，用于管理事件生命周期
 * @param key - 要监听的按键名称，如 'Enter', 'Escape', 'a' 等
 * @param handler - 按键匹配时执行的回调函数
 * @param options - 键盘绑定选项，定义修饰键的组合要求
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * 
 * // 监听 Ctrl+S 组合键
 * bindKey(scope, 's', (event) => {
 *   event.preventDefault();
 *   console.log('保存操作');
 * }, { ctrl: true });
 * 
 * // 监听 Escape 键
 * bindKey(scope, 'Escape', () => {
 *   console.log('取消操作');
 * });
 * 
 * // 监听 Ctrl+Shift+K 组合键
 * bindKey(scope, 'k', () => {
 *   console.log('执行特殊操作');
 * }, { ctrl: true, shift: true });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindKey(
    scope: EventScope<any>,
    key: string,
    handler: (e: KeyboardEvent) => void,
    options: KeyBindingOptions = {}
) {
    const listener = (e: KeyboardEvent) => {
        if (
            e.key === key &&
            (options.ctrl === undefined || e.ctrlKey === options.ctrl) &&
            (options.shift === undefined || e.shiftKey === options.shift) &&
            (options.alt === undefined || e.altKey === options.alt) &&
            (options.meta === undefined || e.metaKey === options.meta)
        ) {
            handler(e);
        }
    };

    window.addEventListener("keydown", listener);

    // 使用 addCleanup 方法添加清理函数
    scope.addCleanup(() => {
        window.removeEventListener("keydown", listener);
    });
}