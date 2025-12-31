
import { promises as fs } from 'fs';
import { Chunk } from '../types';


export class FileChunkProvider {
  private fd?: fs.FileHandle;
  private offset = 0;
  private chunkIndex = 0;

  constructor(
    private readonly filePath: string,
    private readonly chunkSize: number = 1024 * 1024 // 1MB
  ) {}

  async next(): Promise<Chunk | null> {
    if (!this.fd) {
      this.fd = await fs.open(this.filePath, 'r');
    }

    const buffer = Buffer.allocUnsafe(this.chunkSize);
    const { bytesRead } = await this.fd.read(
      buffer,
      0,
      this.chunkSize,
      this.offset
    );

    if (bytesRead === 0) {
      await this.fd.close();
      this.fd = undefined;
      return null;
    }

    const data = buffer.subarray(0, bytesRead);
    this.offset += bytesRead;

    return {
      id: `chunk-${this.chunkIndex++}`,
      data: data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength
      ),
    };
  }

  reset(): void {
    this.offset = 0;
    this.chunkIndex = 0;
  }
}
