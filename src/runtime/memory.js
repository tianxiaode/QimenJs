"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManager = exports.MemoryTicket = void 0;
/**
 * 内存票据类，用于跟踪和释放已分配的内存
 */
class MemoryTicket {
    constructor(manager, // 内存管理器实例
    bytes // 票据对应的内存大小
    ) {
        this.manager = manager;
        this.bytes = bytes;
        this.released = false;
    }
    /**
     * 释放内存，将票据对应的内存大小归还给内存管理器
     */
    release() {
        if (this.released)
            return;
        this.released = true;
        this.manager.release(this.bytes);
    }
}
exports.MemoryTicket = MemoryTicket;
/**
 * 内存管理器类，用于管理内存的分配和释放
 * 实现了内存资源的争用和等待机制
 */
class MemoryManager {
    /**
     * 构造内存管理器实例
     * @param options 内存管理选项
     */
    constructor({ maxBytes, highWatermark }) {
        this.used = 0; // 当前已使用的内存大小
        this.waiters = []; // 等待内存资源的队列
        this.max = maxBytes;
        this.high = highWatermark !== null && highWatermark !== void 0 ? highWatermark : Math.floor(maxBytes * 0.8);
    }
    /**
     * 请求分配指定大小的内存
     * 如果当前可用内存不足，则等待直到有足够内存
     * @param bytes 要分配的内存大小
     * @returns 返回一个内存票据，用于后续释放内存
     */
    async acquire(bytes) {
        if (bytes > this.max) {
            throw new Error(`Request ${bytes} exceeds max memory ${this.max}`);
        }
        // 等待直到有足够的内存可用
        while (this.used + bytes > this.max) {
            await new Promise(resolve => this.waiters.push(resolve));
        }
        this.used += bytes;
        return new MemoryTicket(this, bytes);
    }
    /**
     * 释放指定大小的内存
     * @param bytes 要释放的内存大小
     */
    release(bytes) {
        this.used -= bytes;
        if (this.used < 0)
            this.used = 0;
        // 唤醒一个等待者（FIFO）
        const next = this.waiters.shift();
        next === null || next === void 0 ? void 0 : next();
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
exports.MemoryManager = MemoryManager;
//# sourceMappingURL=memory.js.map