/**
 * StreamChunkProvider 是一个实现 ChunkProvider 接口的类，
 * 用于从 ReadableStream<Uint8Array> 中读取数据并将其分割成块进行处理。
 * 主要用于处理流数据，例如文件上传或下载时的数据块处理。
 */
import { Chunk, ChunkProvider } from '../types';
/**
 * StreamChunkProvider 类实现了 ChunkProvider 接口
 * 用于从 ReadableStream 中读取数据块
 */
export declare class StreamChunkProvider implements ChunkProvider {
    private readonly estimatedChunkSize;
    private reader;
    private chunkIndex;
    private lastDone;
    /**
     * 构造函数
     * @param stream - 需要处理的 ReadableStream<Uint8Array> 流
     * @param estimatedChunkSize - 估计的块大小，默认为 1MB
     */
    constructor(stream: ReadableStream<Uint8Array>, estimatedChunkSize?: number);
    /**
     * 检查是否还有下一个数据块
     * @returns 如果还有数据块则返回 true，否则返回 false
     */
    hasNext(): boolean;
    /**
     * 获取估计的块大小
     * @returns 估计的块大小
     */
    getChunkSize(): number;
    /**
     * 获取总大小
     * @returns 对于流来说，总大小通常是未知的，所以返回 undefined
     */
    getTotalSize(): undefined;
    /**
     * 读取下一个数据块
     * @returns 返回一个 Promise，解析为下一个数据块或 null（如果流已结束）
     */
    next(): Promise<Chunk | null>;
}
//# sourceMappingURL=StreamChunkProvider.d.ts.map