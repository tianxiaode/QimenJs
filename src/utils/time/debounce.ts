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
