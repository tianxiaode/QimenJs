export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait = 0,
    immediate = false
): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>) {
        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) fn.apply(this, args);
        }, wait);

        if (callNow) {
            return fn.apply(this, args);
        }
    };
}
