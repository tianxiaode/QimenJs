import { Chunk } from '../types';

/**
 * HashTaskProgress 只负责 4 件事：
 * - 记录总量（如果已知）
 * - 累计已处理量
 * - 计算进度百分比
 * - 生成稳定 snapshot
 * 
 * 明确不负责：
 * - 不关心 chunk 怎么来
 * - 不关心 hash 算法
 * - 不关心 worker
 * - 不判断状态是否合法（那是 State 的事）
 */

/**
 * 任务进度快照接口
 * 
 * 定义了任务进度的快照信息
 */
export interface TaskProgressSnapshot {
    /** 进度百分比，范围为0到1，如果总量未知则为 undefined */
    progress?: number;

    /** 已处理的字节数 */
    processedBytes: number;

    /** 总字节数（如果已知） */
    totalBytes?: number;

    /** 已处理的块数 */
    processedChunks: number;
}

/**
 * 哈希任务进度管理类
 * 
 * 负责跟踪和管理哈希任务的执行进度
 * 
 * 设计原则：
 * - 仅负责进度跟踪和快照生成
 * - 不关心数据块的来源
 * - 不关心哈希算法的实现
 * - 不管理Worker或任务状态
 */
export class HashTaskProgress {
    private processedBytes = 0;
    private processedChunks = 0;
    private totalBytes?: number;

    /**
     * 初始化进度（可选总量）
     * 
     * @param totalBytes 总字节数，可选参数
     */
    init(totalBytes?: number): void {
        this.totalBytes = totalBytes;
        this.processedBytes = 0;
        this.processedChunks = 0;
    }

    /**
     * 处理数据块，更新进度
     * 
     * 该方法会更新已处理的块数和字节数
     * 
     * @param chunk 要处理的数据块，包含字节数信息
     */
    onChunk(chunk: { data: { byteLength: number } }): void {
        this.processedChunks += 1;
        this.processedBytes += chunk.data.byteLength;
    }

    /**
     * 生成只读快照
     * 
     * 计算当前进度百分比并返回进度快照
     * 
     * @returns 任务进度快照
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