export const ZIndexLevel = {
    mask: 1040,
    dropdown: 1050,
    modal: 1060,
    notification: 1070,
    tooltip: 1080,
} as const;

class ZIndexManager {
    private counters = new Map<number, number>();
    private static instance: ZIndexManager;

    static getInstance(): ZIndexManager {
        if (!ZIndexManager.instance) {
            ZIndexManager.instance = new ZIndexManager();
        }
        return ZIndexManager.instance;
    }

    acquire(level: number): number {
        const current = this.counters.get(level) ?? level;
        const next = current + 10;
        this.counters.set(level, next);
        return next;
    }

    release(level: number): void {
        const current = this.counters.get(level) ?? level;
        if (current > level) {
            this.counters.set(level, current - 10);
        }
    }

    debug(): Record<string, number> {
        const snapshot: Record<string, number> = {};
        for (const [key, value] of Object.entries(ZIndexLevel)) {
            const level = value as number;
            snapshot[key] = this.counters.get(level) ?? level;
        }
        return snapshot;
    }
}

export const zIndexManager = ZIndexManager.getInstance();
