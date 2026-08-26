export const ZIndexLevel = {
    mask: 1040,
    dropdown: 1050,
    modal: 1060,
    notification: 1070,
    tooltip: 1080,
} as const;

const counters = new Map<number, number>();

export function nextZIndex(level: number): number {
    const current = counters.get(level) ?? level;
    const next = current + 10;
    counters.set(level, next);
    return next;
}

export function releaseZIndex(level: number): void {
    const current = counters.get(level) ?? level;
    if (current > level) {
        counters.set(level, current - 10);
    }
}