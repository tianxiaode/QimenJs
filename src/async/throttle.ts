export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    wait = 0
): (...args: Parameters<T>) => void {
    let last = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>) {
        const now = Date.now();
        const remaining = wait - (now - last);

        if (remaining <= 0) {
            last = now;
            fn.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                last = Date.now();
                fn.apply(this, args);
            }, remaining);
        }
    };
}
