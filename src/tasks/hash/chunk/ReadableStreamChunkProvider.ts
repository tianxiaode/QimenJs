import { Chunk } from '../types/chunk';

export class StreamChunkProvider {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private chunkIndex = 0;

  constructor(stream: ReadableStream<Uint8Array>) {
    this.reader = stream.getReader();
  }

  async next(): Promise<Chunk | null> {
    const { value, done } = await this.reader.read();

    if (done || !value) {
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
