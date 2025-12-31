import { Chunk } from '../types';

/**
 * HashTaskProgress 只负责 4 件事：
 * 记录总量（如果已知）
 * 累计已处理量
 * 计算进度百分比
 * 生成稳定 snapshot
 * ❌ 不做：
 * 不关心 chunk 怎么来
 * 不关心 hash 算法
 * 不关心 worker
 * 不判断状态是否合法（那是 State 的事）
 */
export interface TaskProgressSnapshot {
    /** 0 ~ 1，未知总量时为 undefined */
    progress?: number;

    /** 已处理字节数 */
    processedBytes: number;

    /** 总字节数（如果已知） */
    totalBytes?: number;

    /** 已处理 chunk 数 */
    processedChunks: number;
}

export class HashTaskProgress {
    private processedBytes = 0;
    private processedChunks = 0;
    private totalBytes?: number;

    /**
     * 初始化进度（可选总量）
     */
    init(totalBytes?: number): void {
        this.totalBytes = totalBytes;
        this.processedBytes = 0;
        this.processedChunks = 0;
    }

    /**
     * ✅ 这样修改方便后续：Runner 直接把 chunk 丢进来，这里处理所有计数
     */
    onChunk(chunk: { data: { byteLength: number } }): void {
        this.processedChunks += 1;
        this.processedBytes += chunk.data.byteLength;
    }

    /**
     * 生成只读快照
     */
    snapshot(): TaskProgressSnapshot {
        // ✅ 符合原则：在生成快照时计算百分比（0~1）
        const progress =
            this.totalBytes !== undefined && this.totalBytes > 0
                ? Math.min(this.processedBytes / this.totalBytes, 1)
                : undefined;

        return {
            progress,
            processedBytes: this.processedBytes,
            totalBytes: this.totalBytes,
            processedChunks: this.processedChunks,
        };
    }
}
