import { Chunk, ChunkProvider } from "../types";

/**
 * BrowserFileChunkProvider 是一个用于将文件或 Blob 分块处理的提供者
 * 它实现了 ChunkProvider 接口，可以在浏览器环境中将大文件切分为小块进行处理
 */
export class BrowserFileChunkProvider implements ChunkProvider {
    private offset = 0;
    private chunkIndex = 0;

    /**
     * 创建一个 BrowserFileChunkProvider 实例
     * @param file - 要分块的 File 或 Blob 对象
     * @param chunkSize - 每个块的大小，默认为 1MB (1024 * 1024 字节)
     */
    constructor(
        private readonly file: File | Blob,
        private readonly chunkSize: number = 1024 * 1024
    ) {}

    /**
     * 检查是否还有剩余的数据未被分块
     * @returns 如果还有未处理的数据则返回 true，否则返回 false
     */
    hasNext(): boolean {
        return this.offset < this.file.size;
    }

    /**
     * 获取当前分块的大小
     * @returns 分块大小（字节数）
     */
    getChunkSize(): number {
        return this.chunkSize;
    }

    /**
     * 获取文件总大小
     * @returns 文件总大小（字节数）
     */
    getTotalSize(): number {
        return this.file.size;
    }

    /**
     * 获取下一个数据块
     * @returns 一个 Promise，解析为 Chunk 对象或 null（如果没有更多数据块）
     */
    async next(): Promise<Chunk | null> {
        if (!this.hasNext()) return null;

        const end = Math.min(this.offset + this.chunkSize, this.file.size);
        const blob = this.file.slice(this.offset, end);
        const buffer = await blob.arrayBuffer(); // 浏览器标准 API

        const chunk: Chunk = {
            id: `chunk-${this.chunkIndex++}`,
            data: buffer
        };

        this.offset = end;
        return chunk;
    }
}