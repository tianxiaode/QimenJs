import { Chunk, ChunkProvider } from '../types';

export class BrowserFileChunkProvider implements ChunkProvider {
    private offset = 0;
    private chunkIndex = 0;

    constructor(
        private readonly file: File | Blob,
        private readonly chunkSize: number = 1024 * 1024
    ) {}

    hasNext(): boolean {
        return this.offset < this.file.size;
    }

    getChunkSize(): number {
        return this.chunkSize;
    }

    getTotalSize(): number {
        return this.file.size;
    }

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