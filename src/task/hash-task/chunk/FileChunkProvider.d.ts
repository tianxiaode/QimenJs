import { Chunk, ChunkProvider } from '../types';
/**
 * FileChunkProvider 是一个用于将文件分块处理的提供者
 * 它实现了 ChunkProvider 接口，可以在 Node.js 环境中将大文件切分为小块进行处理
 */
export declare class FileChunkProvider implements ChunkProvider {
    private readonly filePath;
    private readonly chunkSize;
    private fd?;
    private offset;
    private chunkIndex;
    private fileSize;
    /**
     * 创建一个 FileChunkProvider 实例
     * @param filePath - 要分块的文件路径
     * @param chunkSize - 每个块的大小，默认为 1MB (1024 * 1024 字节)
     */
    constructor(filePath: string, chunkSize?: number);
    /**
     * 确保文件已打开，如果尚未打开则打开文件并获取文件大小
     * @returns 一个 Promise，当文件打开完成时解析
     */
    private ensureOpened;
    /**
     * 检查是否还有剩余的数据未被分块
     * @returns 如果还有未处理的数据则返回 true，否则返回 false
     */
    hasNext(): boolean;
    /**
     * 获取当前分块的大小
     * @returns 分块大小（字节数）
     */
    getChunkSize(): number;
    /**
     * 获取文件总大小
     * @returns 文件总大小（字节数）
     */
    getTotalSize(): number;
    /**
     * 获取下一个数据块
     * @returns 一个 Promise，解析为 Chunk 对象或 null（如果没有更多数据块）
     */
    next(): Promise<Chunk | null>;
    /**
     * 重置分块提供者到初始状态
     * 将偏移量和块索引重置为 0，以便重新开始分块
     */
    reset(): void;
}
//# sourceMappingURL=FileChunkProvider.d.ts.map