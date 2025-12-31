import { promises as fs } from 'fs';
import { Chunk, ChunkProvider } from '../types';

export class FileChunkProvider implements ChunkProvider {
    private fd?: fs.FileHandle;
    private offset = 0;
    private chunkIndex = 0;
    private fileSize: number = 0; // ✨ 记录总大小

    constructor(
        private readonly filePath: string,
        private readonly chunkSize: number = 1024 * 1024
    ) {}

    // ✨ 必须提前获取文件信息
    private async ensureOpened() {
        if (!this.fd) {
            this.fd = await fs.open(this.filePath, 'r');
            const stat = await this.fd.stat();
            this.fileSize = stat.size;
        }
    }

    hasNext(): boolean {
        // 如果还没打开，假设有数据；如果打开了，看 offset
        return !this.fd || this.offset < this.fileSize;
    }

    getChunkSize(): number {
        return this.chunkSize;
    }

    getTotalSize(): number {
        return this.fileSize;
    }
    async next(): Promise<Chunk | null> {
        await this.ensureOpened();
        
        if (!this.fd) {
            this.fd = await fs.open(this.filePath, 'r');
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

    reset(): void {
        this.offset = 0;
        this.chunkIndex = 0;
    }
}
