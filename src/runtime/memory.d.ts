/**
 * 内存管理选项接口
 */
export interface MemoryOptions {
    maxBytes: number;
    highWatermark?: number;
}
/**
 * 内存快照接口
 */
export interface MemorySnapshot {
    used: number;
    max: number;
    highWatermark: number;
}
/**
 * 内存票据接口
 */
export interface IMemoryTicket {
    readonly bytes: number;
    release(): void;
}
/**
 * 内存票据类，用于跟踪和释放已分配的内存
 */
export declare class MemoryTicket implements IMemoryTicket {
    private readonly manager;
    readonly bytes: number;
    private released;
    constructor(manager: MemoryManager, // 内存管理器实例
    bytes: number);
    /**
     * 释放内存，将票据对应的内存大小归还给内存管理器
     */
    release(): void;
}
/**
 * 内存管理器类，用于管理内存的分配和释放
 * 实现了内存资源的争用和等待机制
 */
export declare class MemoryManager {
    private used;
    private readonly max;
    private readonly high;
    private waiters;
    /**
     * 构造内存管理器实例
     * @param options 内存管理选项
     */
    constructor({ maxBytes, highWatermark }: MemoryOptions);
    /**
     * 请求分配指定大小的内存
     * 如果当前可用内存不足，则等待直到有足够内存
     * @param bytes 要分配的内存大小
     * @returns 返回一个内存票据，用于后续释放内存
     */
    acquire(bytes: number): Promise<IMemoryTicket>;
    /**
     * 释放指定大小的内存
     * @param bytes 要释放的内存大小
     */
    release(bytes: number): void;
    /**
     * 获取当前内存使用情况的快照
     * @returns 返回内存快照对象
     */
    snapshot(): {
        used: number;
        max: number;
        highWatermark: number;
    };
}
//# sourceMappingURL=memory.d.ts.map