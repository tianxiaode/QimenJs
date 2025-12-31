

export interface MemoryOptions {
    maxBytes: number; // 总内存上限
    highWatermark?: number; // 触发警告 / backpressure
}

export interface MemorySnapshot {
    used: number;
    max: number;
    highWatermark: number;
}

export interface IMemoryTicket {
  release(): void;
}

export class MemoryTicket implements IMemoryTicket {
    private released = false;

    constructor(
        private readonly manager: MemoryManager,
        public readonly bytes: number
    ) {}

    release(): void {
        if (this.released) return;
        this.released = true;
        this.manager.release(this.bytes);
    }
}

export class MemoryManager {
    private used = 0;
    private readonly max: number;
    private readonly high: number;
    private waiters: Array<() => void> = [];

    constructor({ maxBytes, highWatermark }: MemoryOptions) {
        this.max = maxBytes;
        this.high = highWatermark ?? Math.floor(maxBytes * 0.8);
    }

    async acquire(bytes: number): Promise<IMemoryTicket> {
        if (bytes > this.max) {
            throw new Error(`Request ${bytes} exceeds max memory ${this.max}`);
        }

        while (this.used + bytes > this.max) {
            await new Promise<void>(resolve => this.waiters.push(resolve));
        }

        this.used += bytes;
        return new MemoryTicket(this, bytes);
    }

    release(bytes: number): void {
        this.used -= bytes;
        if (this.used < 0) this.used = 0;

        // 唤醒一个等待者（FIFO）
        const next = this.waiters.shift();
        next?.();
    }

    snapshot() {
        return {
            used: this.used,
            max: this.max,
            highWatermark: this.high,
        };
    }
}
