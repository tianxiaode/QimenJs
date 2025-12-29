export function repeat(times: number, interval: number, fn: () => void): { cancel(): void } {
    let count = 0;
    let active = true;

    const id = setInterval(() => {
        if (!active) return;
        fn();
        count++;
        if (count >= times) {
            clearInterval(id);
            active = false;
        }
    }, interval);

    return {
        cancel() {
            if (!active) return;
            active = false;
            clearInterval(id);
        },
    };
}
