import { FileChunkProvider } from '@/task/hash-task/chunk';
import { promises as fs } from 'fs';

// Mock fs module
jest.mock('fs', () => ({
    promises: {
        open: jest.fn(),
    },
}));

// 为了测试，我们需要模拟fs的实现
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock FileHandle，实现必要的方法
class MockFileHandle {
    fd: number = 0;
    private readonly data: Buffer;

    constructor(data: Buffer) {
        this.data = data;
    }

    async stat() {
        return {
            isFile: () => true,
            isDirectory: () => false,
            isBlockDevice: () => false,
            isCharacterDevice: () => false,
            isSymbolicLink: () => false,
            isFIFO: () => false,
            isSocket: () => false,
            dev: 0,
            ino: 0,
            mode: 0,
            nlink: 0,
            uid: 0,
            gid: 0,
            rdev: 0,
            size: this.data.length,
            blksize: 0,
            blocks: 0,
            atimeMs: 0,
            mtimeMs: 0,
            ctimeMs: 0,
            birthtimeMs: 0,
            atime: new Date(),
            mtime: new Date(),
            ctime: new Date(),
            birthtime: new Date(),
        };
    }

    async read(buffer: Buffer, offset: number, length: number, position: number) {
        const bytesRead = Math.min(length, this.data.length - position);
        if (bytesRead <= 0) {
            return { bytesRead: 0, buffer };
        }

        this.data.copy(buffer, offset, position, position + bytesRead);
        return { bytesRead, buffer };
    }

    async close() {
        // 模拟关闭操作
    }
}

describe('FileChunkProvider', () => {
    let testData: Buffer;

    beforeEach(() => {
        // 重置mock
        (fs.open as jest.MockedFunction<typeof fs.open>).mockClear();

        // 创建测试数据
        testData = Buffer.alloc(3 * 1024 * 1024, 'a'); // 3MB of data
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it('should initialize with correct file path and chunk size', async () => {
        const defaultChunkSize = 1024 * 1024; // 1MB
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(testData) as any
        );

        const provider = new FileChunkProvider('some/path');
        expect(provider.getChunkSize()).toBe(defaultChunkSize);
    });

    it('should initialize with custom chunk size', async () => {
        const customChunkSize = 512 * 1024; // 512KB
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(testData) as any
        );

        const provider = new FileChunkProvider('some/path', customChunkSize);
        expect(provider.getChunkSize()).toBe(customChunkSize);
    });

    it('should return correct total file size after initialization', async () => {
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(testData) as any
        );

        const provider = new FileChunkProvider('some/path');
        // Total size is only available after ensureOpened is called
        await (provider as any).ensureOpened();
        expect(provider.getTotalSize()).toBe(testData.length);
    });

    it('should return true for hasNext when there is more data', async () => {
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(testData) as any
        );

        const provider = new FileChunkProvider('some/path');
        expect(provider.hasNext()).toBe(true);
    });

    it('should return correct number of chunks for a file', async () => {
        const smallData = Buffer.alloc(2500, 'a'); // 2500 bytes
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(smallData) as any
        );

        const chunkSize = 1024; // 1KB chunks
        const provider = new FileChunkProvider('some/path', chunkSize);

        let chunksCount = 0;
        while (provider.hasNext()) {
            const chunk = await provider.next();
            if (chunk) {
                chunksCount++;
                expect(chunk.id).toMatch(/^chunk-\d+$/);
                expect(chunk.data).toBeDefined();
                expect(chunk.data).not.toBeNull();
            }
        }

        expect(chunksCount).toBe(3); // 2500 bytes with 1024 chunk size = 3 chunks
    });

    it('should handle chunking when file size is exactly divisible by chunk size', async () => {
        const chunkSize = 1024; // 1KB
        const totalSize = 3 * chunkSize; // 3KB
        const data = Buffer.alloc(totalSize, 'a');

        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(data) as any
        );

        const provider = new FileChunkProvider('some/path', chunkSize);

        let chunksCount = 0;
        while (provider.hasNext()) {
            const chunk = await provider.next();
            if (chunk) {
                chunksCount++;
                expect(chunk.id).toMatch(/^chunk-\d+$/);
                expect(chunk.data).toBeDefined();
                expect(chunk.data).not.toBeNull();
                expect(chunk.data.byteLength).toBeLessThanOrEqual(chunkSize);
            }
        }

        // Should have exactly 3 chunks
        expect(chunksCount).toBe(3);
    });

    it('should generate sequentially numbered chunk IDs', async () => {
        const data = Buffer.alloc(2500, 'a'); // 2.5KB
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(data) as any
        );

        const chunkSize = 1024; // 1KB chunks
        const provider = new FileChunkProvider('some/path', chunkSize);

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
        const data = Buffer.alloc(500, 'a'); // 500 bytes
        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(
            new MockFileHandle(data) as any
        );

        const provider = new FileChunkProvider('some/path', 1024); // 1KB chunks

        const firstChunk = await provider.next();
        expect(firstChunk).not.toBeNull();
        expect(firstChunk?.data.byteLength).toBe(500);

        const nullChunk = await provider.next();
        expect(nullChunk).toBeNull();
    });

    it('should call close on file handle when file is fully read', async () => {
        const closeSpy = jest.spyOn(MockFileHandle.prototype, 'close');
        const data = Buffer.alloc(500, 'a'); // 500 bytes
        const mockHandle = new MockFileHandle(data);

        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(mockHandle as any);

        const provider = new FileChunkProvider('some/path', 1024); // 1KB chunks

        // Read all chunks
        await provider.next();
        await provider.next(); // This should trigger close

        expect(closeSpy).toHaveBeenCalled();
        closeSpy.mockRestore();
    });

    it('should handle the case when bytesRead is 0 on first read', async () => {
        const emptyData = Buffer.alloc(0); // Empty buffer
        const mockHandle = new MockFileHandle(emptyData);

        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(mockHandle as any);

        const provider = new FileChunkProvider('some/path', 1024); // 1KB chunks

        const chunk = await provider.next();
        expect(chunk).toBeNull();
    });

    it('should call ensureOpened to open file if not already opened', async () => {
        const data = Buffer.alloc(500, 'a'); // 500 bytes
        const mockHandle = new MockFileHandle(data);

        (fs.open as jest.MockedFunction<typeof fs.open>).mockResolvedValue(mockHandle as any);

        const provider = new FileChunkProvider('some/path', 1024);

        // Check that file size is 0 before ensureOpened
        expect(provider.getTotalSize()).toBe(0);

        // Call ensureOpened
        await (provider as any).ensureOpened();

        // Now check that file size is updated
        expect(provider.getTotalSize()).toBe(500);
    });

    it('should reset the provider to initial state', () => {
        const provider = new FileChunkProvider('some/path', 1024);

        // Manually change offset and chunkIndex to simulate reading
        (provider as any).offset = 1024;
        (provider as any).chunkIndex = 5;

        expect((provider as any).offset).toBe(1024);
        expect((provider as any).chunkIndex).toBe(5);

        provider.reset();

        expect((provider as any).offset).toBe(0);
        expect((provider as any).chunkIndex).toBe(0);
    });

    it('should handle case where ensureOpened does not set file descriptor by mocking the method', async () => {
        const data = Buffer.alloc(1000, 'a'); // 1000 bytes
        const mockHandle = new MockFileHandle(data);

        (fs.open as jest.MockedFunction<typeof fs.open>)
            .mockResolvedValueOnce(mockHandle as any) // 第一次调用ensureOpened时
            .mockResolvedValueOnce(mockHandle as any); // 第二次调用next中的if块时

        const provider = new FileChunkProvider('some/path', 1024);

        // Mock ensureOpened to not set this.fd
        const originalEnsureOpened = (provider as any).ensureOpened;
        jest.spyOn(provider as any, 'ensureOpened').mockImplementation(() => {
            // 不设置this.fd，直接返回
            return Promise.resolve();
        });

        // 直接调用next方法，这将触发next方法中的额外检查
        const chunk = await provider.next();

        expect(chunk).not.toBeNull();
        expect(chunk?.id).toMatch(/^chunk-\d+$/);
        expect(chunk?.data).toBeDefined();

        // 恢复原始方法
        jest.spyOn(provider as any, 'ensureOpened').mockRestore();
    });
});
