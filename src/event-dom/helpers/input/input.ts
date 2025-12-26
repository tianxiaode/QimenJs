/**
 * 监听输入元素的实时输入事件
 * 每次输入值变化时立即触发
 * 
 * @param scope - 事件作用域
 * @param target - 输入元素
 * @param handler - 输入时的回调函数
 * @param options - 配置选项（节流、防抖等）
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const searchInput = document.getElementById('search');
 * 
 * bindInput(scope, searchInput, (value) => {
 *   console.log('实时搜索:', value);
 *   // 实时搜索建议
 *   fetchSuggestions(value);
 * }, { wait: 300 }); // 300ms节流，避免频繁请求
 * ```
 */
import { EventScope } from "@orbitjs/event-core";
import { throttle, debounce } from "@orbitjs/async";

export interface InputOptions {
    wait?: number;           // 节流时间（毫秒）
    debounceWait?: number;   // 防抖时间（毫秒）
    immediate?: boolean;     // 防抖是否立即执行
}

export function bindInput(
    scope: EventScope<any>,
    target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    handler: (value: string, event: Event) => void,
    options: InputOptions = {}
) {
    const inputListener = (e: Event) => {
        handler((e.target as HTMLInputElement).value, e);
    };

    let listener: (e: Event) => void = inputListener;

    // 应用节流或防抖
    if (options.wait) {
        listener = throttle(inputListener, options.wait);
    } else if (options.debounceWait) {
        listener = debounce(inputListener, options.debounceWait, options.immediate);
    }

    target.addEventListener("input", listener);
    
    scope.addCleanup(() => {
        target.removeEventListener("input", listener);
    });
}