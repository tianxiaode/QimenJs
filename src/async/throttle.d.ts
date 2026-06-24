/**
 * 节流函数 - 在指定时间 wait 内，函数最多只会执行一次
 *
 * @description
 * 节流是一种函数调用技术，确保函数在指定的时间间隔内最多只执行一次。
 * 这可以限制函数执行的频率，避免在短时间内重复执行。
 *
 * @template T - 函数类型
 * @param fn - 需要节流的函数
 * @param wait - 时间间隔（毫秒）
 * @returns 返回处理后的函数，该函数接收与原函数相同的参数
 *
 * @example
 * ```ts
 * const throttledFunction = throttle(() => console.log('Hello'), 1000);
 * throttledFunction(); // 立即执行
 * throttledFunction(); // 不执行
 * throttledFunction(); // 不执行
 * // 1000ms 后，再次调用会执行
 * ```
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, wait?: number): (...args: Parameters<T>) => void;
//# sourceMappingURL=throttle.d.ts.map