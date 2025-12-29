import type { Cancelable } from './types';

export function every(interval: number, callback: () => void): Cancelable {
    let active = true;

    const id = setInterval(
        () => {
            if (!active) return;
            callback();
        },
        Math.max(0, interval)
    );

    return {
        cancel() {
            if (!active) return;
            active = false;
            clearInterval(id);
        },
        isActive() {
            return active;
        },
    };
}
