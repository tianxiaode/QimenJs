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

        if (remaining <= 0) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastInvokeTime = now;
            fn.apply(context, args);
        } else if (!timer) {
            timer = setTimeout(() => {
                timer = null;
                lastInvokeTime = Date.now();
                fn.apply(context, args);
            }, remaining);
        }
    };
}
