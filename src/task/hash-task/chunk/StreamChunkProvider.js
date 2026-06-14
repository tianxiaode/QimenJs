"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamChunkProvider = void 0;
/**
 * StreamChunkProvider 类实现了 ChunkProvider 接口
 * 用于从 ReadableStream 中读取数据块
 */
class StreamChunkProvider {
    /**
     * 构造函数
     * @param stream - 需要处理的 ReadableStream<Uint8Array> 流
     * @param estimatedChunkSize - 估计的块大小，默认为 1MB
     */
    constructor(stream, estimatedChunkSize = 1024 * 1024 // 流通常没有固定 chunk，需指定估值
    ) {
        this.estimatedChunkSize = estimatedChunkSize;
        this.chunkIndex = 0;
        this.lastDone = false; // 记录流是否结束
        this.reader = stream.getReader();
    }
    /**
     * 检查是否还有下一个数据块
     * @returns 如果还有数据块则返回 true，否则返回 false
     */
    hasNext() {
        return !this.lastDone;
    }
    /**
     * 获取估计的块大小
     * @returns 估计的块大小
     */
    getChunkSize() {
        return this.estimatedChunkSize;
    }
    /**
     * 获取总大小
     * @returns 对于流来说，总大小通常是未知的，所以返回 undefined
     */
    getTotalSize() {
        return undefined; // 流的大小通常是未知的
    }
    /**
     * 读取下一个数据块
     * @returns 返回一个 Promise，解析为下一个数据块或 null（如果流已结束）
     */
    async next() {
        const { value, done } = await this.reader.read();
        if (done || !value) {
            this.lastDone = true;
            return null;
        }
        return {
            id: `chunk-${this.chunkIndex++}`,
            data: value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength),
        };
    }
}
exports.StreamChunkProvider = StreamChunkProvider;
//# sourceMappingURL=StreamChunkProvider.js.map