/**
 * 内存管理选项接口
 */
export interface MemoryOptions {
    maxBytes: number; // 总内存上限
    highWatermark?: number; // 触发警告 / backpressure
}

/**
 * 内存快照接口
 */
export interface MemorySnapshot {
    used: number; // 已使用内存大小
    max: number; // 最大内存大小
    highWatermark: number; // 高水位线（触发警告的阈值）
}

/**
 * 内存票据接口
 */
export interface IMemoryTicket {
    readonly bytes: number; // 票据对应的内存大小
    release(): void; // 释放内存的方法
}

/**
 * 内存票据类，用于跟踪和释放已分配的内存
 */
export class MemoryTicket implements IMemoryTicket {
    private released = false;

    constructor(
        private readonly manager: MemoryManager, // 内存管理器实例
        public readonly bytes: number // 票据对应的内存大小
    ) {}

    /**
     * 释放内存，将票据对应的内存大小归还给内存管理器
     */
    release(): void {
        if (this.released) return;
        this.released = true;
        this.manager.release(this.bytes);
    }
}

/**
 * 内存管理器类，用于管理内存的分配和释放
 * 实现了内存资源的争用和等待机制
 */
export class MemoryManager {
    private used = 0; // 当前已使用的内存大小
    private readonly max: number; // 最大内存大小
    private readonly high: number; // 高水位线（触发警告的阈值）
    private waiters: Array<() => void> = []; // 等待内存资源的队列

    /**
     * 构造内存管理器实例
     * @param options 内存管理选项
     */
    constructor({ maxBytes, highWatermark }: MemoryOptions) {
        this.max = maxBytes;
        this.high = highWatermark ?? Math.floor(maxBytes * 0.8);
    }

    /**
     * 请求分配指定大小的内存
     * 如果当前可用内存不足，则等待直到有足够内存
     * @param bytes 要分配的内存大小
     * @returns 返回一个内存票据，用于后续释放内存
     */
    async acquire(bytes: number): Promise<IMemoryTicket> {
        if (bytes > this.max) {
            throw new Error(`Request ${bytes} exceeds max memory ${this.max}`);
        }

        // 等待直到有足够的内存可用
        while (this.used + bytes > this.max) {
            await new Promise<void>(resolve => this.waiters.push(resolve));
        }

        this.used += bytes;
        return new MemoryTicket(this, bytes);
    }

    /**
     * 释放指定大小的内存
     * @param bytes 要释放的内存大小
     */
    release(bytes: number): void {
        this.used -= bytes;
        if (this.used < 0) this.used = 0;

        // 唤醒一个等待者（FIFO）
        const next = this.waiters.shift();
        next?.();
    }

    /**
     * 获取当前内存使用情况的快照
     * @returns 返回内存快照对象
     */
    snapshot() {
        return {
            used: this.used,
            max: this.max,
            highWatermark: this.high,
        };
    }
}
