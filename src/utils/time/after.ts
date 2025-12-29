import type { Cancelable } from './types';

export function after(delay: number, callback: () => void): Cancelable {
    let active = true;

    const id = setTimeout(
        () => {
            if (!active) return;
            callback();
            active = false;
        },
        Math.max(0, delay)
    );

    return {
        cancel() {
            if (!active) return;
            active = false;
            clearTimeout(id);
        },
        isActive() {
            return active;
        },
    };
}
