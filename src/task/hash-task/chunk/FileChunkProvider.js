"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileChunkProvider = void 0;
const fs_1 = require("fs");
/**
 * FileChunkProvider 是一个用于将文件分块处理的提供者
 * 它实现了 ChunkProvider 接口，可以在 Node.js 环境中将大文件切分为小块进行处理
 */
class FileChunkProvider {
    /**
     * 创建一个 FileChunkProvider 实例
     * @param filePath - 要分块的文件路径
     * @param chunkSize - 每个块的大小，默认为 1MB (1024 * 1024 字节)
     */
    constructor(filePath, chunkSize = 1024 * 1024) {
        this.filePath = filePath;
        this.chunkSize = chunkSize;
        this.offset = 0;
        this.chunkIndex = 0;
        this.fileSize = 0; // ✨ 记录总大小
    }
    /**
     * 确保文件已打开，如果尚未打开则打开文件并获取文件大小
     * @returns 一个 Promise，当文件打开完成时解析
     */
    // ✨ 必须提前获取文件信息
    async ensureOpened() {
        if (!this.fd) {
            this.fd = await fs_1.promises.open(this.filePath, 'r');
            const stat = await this.fd.stat();
            this.fileSize = stat.size;
        }
    }
    /**
     * 检查是否还有剩余的数据未被分块
     * @returns 如果还有未处理的数据则返回 true，否则返回 false
     */
    hasNext() {
        // 如果还没打开，假设有数据；如果打开了，看 offset
        return !this.fd || this.offset < this.fileSize;
    }
    /**
     * 获取当前分块的大小
     * @returns 分块大小（字节数）
     */
    getChunkSize() {
        return this.chunkSize;
    }
    /**
     * 获取文件总大小
     * @returns 文件总大小（字节数）
     */
    getTotalSize() {
        return this.fileSize;
    }
    /**
     * 获取下一个数据块
     * @returns 一个 Promise，解析为 Chunk 对象或 null（如果没有更多数据块）
     */
    async next() {
        await this.ensureOpened();
        if (!this.fd) {
            this.fd = await fs_1.promises.open(this.filePath, 'r');
        }
        const buffer = Buffer.allocUnsafe(this.chunkSize);
        const { bytesRead } = await this.fd.read(buffer, 0, this.chunkSize, this.offset);
        if (bytesRead === 0) {
            await this.fd.close();
            this.fd = undefined;
            return null;
        }
        const data = buffer.subarray(0, bytesRead);
        this.offset += bytesRead;
        return {
            id: `chunk-${this.chunkIndex++}`,
            data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
        };
    }
    /**
     * 重置分块提供者到初始状态
     * 将偏移量和块索引重置为 0，以便重新开始分块
     */
    reset() {
        this.offset = 0;
        this.chunkIndex = 0;
    }
}
exports.FileChunkProvider = FileChunkProvider;
//# sourceMappingURL=FileChunkProvider.js.map