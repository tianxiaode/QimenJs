/**
 * 创建一个防抖函数，该函数在指定的等待时间后执行，如果在等待时间内再次调用，则重新计时
 * 
 * @param fn - 需要防抖的函数
 * @param wait - 需要等待的毫秒数
 * @param immediate - 如果为true，则立即执行函数，延迟后才能再次执行
 * @returns 返回一个防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait = 0,
    immediate = false
): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let timer: any;
    let result: ReturnType<T>;

    return function (this: any, ...args: Parameters<T>) {
        const context = this;

        const later = () => {
            timer = null;
            if (!immediate) {
                result = fn.apply(context, args);
            }
        };

        const callNow = immediate && !timer;

        clearTimeout(timer);
        timer = setTimeout(later, Math.max(0, wait));

        if (callNow) {
            result = fn.apply(context, args);
        }

        return result;
    };
}