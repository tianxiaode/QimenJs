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
export class StreamChunkProvider implements ChunkProvider {
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private chunkIndex = 0;
    private lastDone = false; // 记录流是否结束

    /**
     * 构造函数
     * @param stream - 需要处理的 ReadableStream<Uint8Array> 流
     * @param estimatedChunkSize - 估计的块大小，默认为 1MB
     */
    constructor(
        stream: ReadableStream<Uint8Array>,
        private readonly estimatedChunkSize: number = 1024 * 1024 // 流通常没有固定 chunk，需指定估值
    ) {
        this.reader = stream.getReader();
    }

    /**
     * 检查是否还有下一个数据块
     * @returns 如果还有数据块则返回 true，否则返回 false
     */
    hasNext(): boolean {
        return !this.lastDone;
    }

    /**
     * 获取估计的块大小
     * @returns 估计的块大小
     */
    getChunkSize(): number {
        return this.estimatedChunkSize;
    }

    /**
     * 获取总大小
     * @returns 对于流来说，总大小通常是未知的，所以返回 undefined
     */
    getTotalSize(): undefined {
        return undefined; // 流的大小通常是未知的
    }

    /**
     * 读取下一个数据块
     * @returns 返回一个 Promise，解析为下一个数据块或 null（如果流已结束）
     */
    async next(): Promise<Chunk | null> {
        const { value, done } = await this.reader.read();

        if (done || !value) {
            this.lastDone = true;
            return null;
        }

        return {
            id: `chunk-${this.chunkIndex++}`,
            data: value.buffer.slice(
                value.byteOffset,
                value.byteOffset + value.byteLength
            ) as ArrayBuffer,
        };
    }
}
