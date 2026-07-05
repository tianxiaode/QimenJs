import { BrowserFileChunkProvider } from '@/task/hash-task/chunk';

// Mock File and Blob interface
class MockFile implements File {
    lastModified: number = 0;
    name: string;
    type: string = '';
    webkitRelativePath: string = '';

    private data: Uint8Array;

    constructor(data: Uint8Array, name: string = 'test-file') {
        this.data = data;
        this.name = name;
    }

    slice(start: number, end: number): Blob {
        // 返回一个新对象，包含arrayBuffer方法，范围是[start, end)
        const slicedData = this.data.subarray(start, end);
        return new MockFile(slicedData, this.name) as unknown as Blob;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.data.buffer as ArrayBuffer;
    }

    // 实现File接口的bytes方法
    async bytes(): Promise<Uint8Array<ArrayBuffer>> {
        return Promise.resolve(new Uint8Array(this.data.buffer as ArrayBuffer));
    }

    // 实现Blob接口的其他方法
    stream(): any {
        throw new Error('Method not implemented.');
    }

    text(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    get [Symbol.toStringTag](): string {
        return 'File';
    }

    // getter属性
    get size(): number {
        return this.data.length;
    }
}

describe('BrowserFileChunkProvider', () => {
    let mockFile: File | Blob;
    const defaultChunkSize = 1024 * 1024; // 1MB

    beforeEach(() => {
        // 创建一个模拟的File对象
        const data = new Uint8Array(3 * 1024 * 1024); // 3MB数据
        mockFile = new MockFile(data, 'test-file');
    });

    it('should initialize with correct file and chunk size', () => {
        const provider = new BrowserFileChunkProvider(mockFile);
        expect(provider.getChunkSize()).toBe(defaultChunkSize);
        expect(provider.getTotalSize()).toBe(3 * 1024 * 1024);
    });

    it('should initialize with custom chunk size', () => {
        const customChunkSize = 512 * 1024; // 512KB
        const provider = new BrowserFileChunkProvider(mockFile, customChunkSize);
        expect(provider.getChunkSize()).toBe(customChunkSize);
    });

    it('should return true for hasNext when there is more data', () => {
        const provider = new BrowserFileChunkProvider(mockFile);
        expect(provider.hasNext()).toBe(true);
    });

    it('should return false for hasNext when all data is processed', async () => {
        const smallData = new Uint8Array(100); // 100 bytes
        const smallFile = new MockFile(smallData, 'small-file');
        const provider = new BrowserFileChunkProvider(smallFile);

        const firstChunk = await provider.next();
        expect(firstChunk).not.toBeNull();
        expect(provider.hasNext()).toBe(false);

        const nullChunk = await provider.next();
        expect(nullChunk).toBeNull();
        expect(provider.hasNext()).toBe(false);
    });

    it('should return correct number of chunks for a file', async () => {
        const data = new Uint8Array(2.5 * 1024 * 1024); // 2.5MB
        const file = new MockFile(data, 'test-file');
        const chunkSize = 1024 * 1024; // 1MB chunks
        const provider = new BrowserFileChunkProvider(file, chunkSize);

        let chunksCount = 0;
        while (provider.hasNext()) {
            const chunk = await provider.next();
            if (chunk) {
                chunksCount++;
                expect(chunk.id).toMatch(/^chunk-\d+$/);
                expect(chunk.data).toBeInstanceOf(ArrayBuffer);
            }
        }

        expect(chunksCount).toBe(3); // 2.5MB / 1MB = 3 chunks
    });

    it('should generate sequentially numbered chunk IDs', async () => {
        const data = new Uint8Array(2500); // 2.5KB
        const file = new MockFile(data, 'test-file');
        const chunkSize = 1024; // 1KB chunks
        const provider = new BrowserFileChunkProvider(file, chunkSize);

        const chunks = [];
        while (provider.hasNext()) {
            const chunk = await provider.next();
            if (chunk) {
                chunks.push(chunk);
            }
        }

        expect(chunks.length).toBe(3);
        expect(chunks[0].id).toBe('chunk-0');
        expect(chunks[1].id).toBe('chunk-1');
        expect(chunks[2].id).toBe('chunk-2');
    });

    it('should return null when no more chunks are available', async () => {
        const data = new Uint8Array(500); // 500 bytes
        const file = new MockFile(data, 'test-file');
        const provider = new BrowserFileChunkProvider(file, 1024); // 1KB chunks

        const firstChunk = await provider.next();
        expect(firstChunk).not.toBeNull();
        expect(firstChunk?.data.byteLength).toBe(500);

        const nullChunk = await provider.next();
        expect(nullChunk).toBeNull();
    });

    it('should create only one chunk when file size is smaller than chunk size', async () => {
        const data = new Uint8Array(500); // 500 bytes
        const file = new MockFile(data, 'test-file');
        const chunkSize = 1024; // 1KB chunks
        const provider = new BrowserFileChunkProvider(file, chunkSize);

        const chunk = await provider.next();
        expect(chunk).not.toBeNull();
        expect(chunk?.data.byteLength).toBe(500);
        expect(chunk?.id).toBe('chunk-0');

        const nullChunk = await provider.next();
        expect(nullChunk).toBeNull();
    });
});
