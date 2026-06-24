"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashTaskProgress = void 0;
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
class HashTaskProgress {
    constructor() {
        this.processedBytes = 0;
        this.processedChunks = 0;
    }
    /**
     * 初始化进度（可选总量）
     *
     * @param totalBytes 总字节数，可选参数
     */
    init(totalBytes) {
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
    onChunk(chunk) {
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
    snapshot() {
        // ✅ 符合原则：在生成快照时计算百分比（0~1）
        const progress = this.totalBytes !== undefined && this.totalBytes > 0
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
exports.HashTaskProgress = HashTaskProgress;
//# sourceMappingURL=HashTaskProgress.js.map