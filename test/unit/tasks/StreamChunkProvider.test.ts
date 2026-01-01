import { StreamChunkProvider } from '@/tasks/hash-task/chunk';

// Mock ReadableStream for testing
class MockReadableStream {
  private chunks: Uint8Array[];
  private index = 0;
  private closed = false;

  constructor(data: Uint8Array[]) {
    this.chunks = data;
  }

  getReader() {
    return {
      read: async () => {
        if (this.index < this.chunks.length) {
          const chunk = this.chunks[this.index++];
          return { value: chunk, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
      cancel: () => {
        this.closed = true;
        return Promise.resolve();
      }
    };
  }
}

describe('StreamChunkProvider', () => {
  const defaultChunkSize = 1024 * 1024; // 1MB

  it('should initialize with correct stream and chunk size', () => {
    const chunks = [new Uint8Array(1024)];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    expect(provider.getChunkSize()).toBe(defaultChunkSize);
    expect(provider.getTotalSize()).toBeUndefined();
  });

  it('should initialize with custom chunk size', () => {
    const customChunkSize = 512 * 1024; // 512KB
    const chunks = [new Uint8Array(1024)];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any, customChunkSize);

    expect(provider.getChunkSize()).toBe(customChunkSize);
  });

  it('should return true for hasNext when stream has more data', () => {
    const chunks = [new Uint8Array(1024)];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    expect(provider.hasNext()).toBe(true);
  });

  it('should return false for hasNext when stream is done', async () => {
    const chunks: Uint8Array[] = []; // Empty stream
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    const chunk = await provider.next();
    expect(chunk).toBeNull();
    expect(provider.hasNext()).toBe(false);
  });

  it('should return correct number of chunks from stream', async () => {
    const chunks = [
      new Uint8Array(512),
      new Uint8Array(512),
      new Uint8Array(256)
    ];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    let chunksCount = 0;
    while (provider.hasNext()) {
      const chunk = await provider.next();
      if (chunk) {
        chunksCount++;
        expect(chunk.id).toMatch(/^chunk-\d+$/);
        expect(chunk.data).toBeInstanceOf(ArrayBuffer);
      } else {
        break;
      }
    }

    expect(chunksCount).toBe(3);
  });

  it('should generate sequentially numbered chunk IDs', async () => {
    const chunks = [
      new Uint8Array(512),
      new Uint8Array(512),
      new Uint8Array(256)
    ];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    const chunkList = [];
    while (provider.hasNext()) {
      const chunk = await provider.next();
      if (chunk) {
        chunkList.push(chunk);
      } else {
        break;
      }
    }

    expect(chunkList.length).toBe(3);
    expect(chunkList[0].id).toBe('chunk-0');
    expect(chunkList[1].id).toBe('chunk-1');
    expect(chunkList[2].id).toBe('chunk-2');
  });

  it('should convert stream chunks to ArrayBuffers', async () => {
    const data1 = new Uint8Array([1, 2, 3]);
    const data2 = new Uint8Array([4, 5, 6]);
    const chunks = [data1, data2];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    const firstChunk = await provider.next();
    const secondChunk = await provider.next();

    expect(firstChunk).not.toBeNull();
    expect(firstChunk?.data).toBeInstanceOf(ArrayBuffer);
    expect(firstChunk?.data.byteLength).toBe(3);

    expect(secondChunk).not.toBeNull();
    expect(secondChunk?.data).toBeInstanceOf(ArrayBuffer);
    expect(secondChunk?.data.byteLength).toBe(3);

    // Verify the content
    const firstArray = new Uint8Array(firstChunk!.data);
    const secondArray = new Uint8Array(secondChunk!.data);
    expect(Array.from(firstArray)).toEqual([1, 2, 3]);
    expect(Array.from(secondArray)).toEqual([4, 5, 6]);
  });

  it('should return null when stream is done', async () => {
    const chunks = [new Uint8Array(512)];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    const firstChunk = await provider.next();
    expect(firstChunk).not.toBeNull();

    const nullChunk = await provider.next();
    expect(nullChunk).toBeNull();
    expect(provider.hasNext()).toBe(false);
  });

  it('should handle empty stream', async () => {
    const chunks: Uint8Array[] = [];
    const stream = new MockReadableStream(chunks);
    const provider = new StreamChunkProvider(stream as any);

    const chunk = await provider.next();
    expect(chunk).toBeNull();
    expect(provider.hasNext()).toBe(false);
  });
});