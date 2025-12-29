/**
 * 创建一个节流函数，确保函数在指定的时间间隔内最多只执行一次
 * 
 * @param fn - 需要节流的函数
 * @param wait - 时间间隔（毫秒）
 * @returns 返回一个节流处理后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    wait = 0
): (...args: Parameters<T>) => void {
    let lastInvokeTime = 0;
    let timer: any;

    return function (this: any, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = wait - (now - lastInvokeTime);
        const context = this;

        // 如果已经过了等待时间，则立即执行
        if (remaining <= 0) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastInvokeTime = now;
            fn.apply(context, args);
        } else if (!timer) {
            // 否则，设置定时器，在剩余时间后执行
            timer = setTimeout(() => {
                timer = null;
                lastInvokeTime = Date.now();
                fn.apply(context, args);
            }, remaining);
        }
    };
}