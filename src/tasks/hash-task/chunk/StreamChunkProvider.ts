import { Chunk, ChunkProvider } from '../types';

export class StreamChunkProvider implements ChunkProvider {
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private chunkIndex = 0;
    private lastDone = false; // ✨ 记录流是否结束

    constructor(
        stream: ReadableStream<Uint8Array>,
        private readonly estimatedChunkSize: number = 1024 * 1024 // ✨ 流通常没有固定 chunk，需指定估值
    ) {
        this.reader = stream.getReader();
    }

    hasNext(): boolean {
        return !this.lastDone;
    }

    getChunkSize(): number {
        return this.estimatedChunkSize;
    }

    getTotalSize(): undefined {
        return undefined; // 流的大小通常是未知的
    }

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
