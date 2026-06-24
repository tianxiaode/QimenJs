/**
 * 防抖函数 - 在指定时间 wait 内，如果函数被多次调用，则只执行最后一次调用
 * 如果设置了 immediate 为 true，则会在延时之前立即执行
 *
 * @description
 * 防抖是一种函数调用技术，它确保函数在指定的等待时间内不被重复执行。
 * 如果在等待期间再次调用函数，则会重新开始计时。
 *
 * @template T - 函数类型
 * @param fn - 需要防抖的函数
 * @param wait - 延迟时间（毫秒）
 * @param immediate - 是否立即执行（true 为立即执行，false 为延迟后执行）
 * @returns 返回处理后的函数，该函数接收与原函数相同的参数
 *
 * @example
 * ```ts
 * const debouncedFunction = debounce(() => console.log('Hello'), 300);
 * debouncedFunction(); // 不会立即执行
 * debouncedFunction(); // 重新开始计时
 * // 300ms 后，执行 'Hello'
 * ```
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, wait?: number, immediate?: boolean): {
    (this: any, ...args: Parameters<T>): any;
    cancel(): void;
} & {
    cancel(): void;
};
//# sourceMappingURL=debounce.d.ts.map