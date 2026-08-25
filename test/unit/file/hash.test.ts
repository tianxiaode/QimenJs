import { createFileHashTask } from '@/file/hash';

class MockFile {
    readonly size: number;
    private data: Uint8Array;

    constructor(
        data: Uint8Array,
        public readonly name: string = 'test'
    ) {
        this.data = data;
        this.size = data.length;
    }

    slice(start: number, end: number): Blob {
        const sliced = this.data.subarray(start, end);
        const buffer = sliced.buffer.slice(
            sliced.byteOffset,
            sliced.byteOffset + sliced.byteLength
        ) as ArrayBuffer;
        return { arrayBuffer: async () => buffer } as Blob;
    }
}

function toHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function sha256Supported(): boolean {
    return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

describe('createFileHashTask', () => {
    it('should compute MD5 hash correctly', async () => {
        const file = new MockFile(new Uint8Array([0x61])); // "a"
        const task = createFileHashTask(file as unknown as File, 'md5');
        await task.start();
        const hex = toHex(await task.result());
        expect(hex).toBe('0cc175b9c0f1b6a831c399e269772661');
    });

    it('should compute MD5 for empty file', async () => {
        const file = new MockFile(new Uint8Array(0));
        const task = createFileHashTask(file as unknown as File, 'md5');
        await task.start();
        const hex = toHex(await task.result());
        expect(hex).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('should compute MD5 for larger content', async () => {
        const content = new Uint8Array(1024 * 64);
        for (let i = 0; i < content.length; i++) content[i] = i & 0xff;
        const file = new MockFile(content);
        const task = createFileHashTask(file as unknown as File, 'md5');
        await task.start();
        const hex = toHex(await task.result());
        expect(hex).toBe('8f1445bafe2c2095044af7789462f475');
    });

    (sha256Supported() ? it : it.skip)('should compute SHA-256 hash correctly', async () => {
        const file = new MockFile(new Uint8Array([0x61]));
        const task = createFileHashTask(file as unknown as File, 'sha256');
        await task.start();
        const hex = toHex(await task.result());
        expect(hex).toBe('ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
    });

    (sha256Supported() ? it : it.skip)('should compute SHA-512 hash correctly', async () => {
        const file = new MockFile(new Uint8Array([0x61]));
        const task = createFileHashTask(file as unknown as File, 'sha512');
        await task.start();
        const hex = toHex(await task.result());
        expect(hex).toBe(
            '1f40fc92da241694750979ee6cf582f2d5d7d28e18335de05abc54d0560e0f5302860c652bf08d560252aa5e74210546fbbbce8c12cfc7957b2652fe9a75c185'
        );
    });

    it('should call progress callback', async () => {
        const content = new Uint8Array(1024 * 64);
        const file = new MockFile(content);
        const task = createFileHashTask(file as unknown as File, 'md5');
        const progressSpy = jest.fn();
        task.onProgress(progressSpy);
        await task.start();
        expect(progressSpy).toHaveBeenCalled();
        expect(progressSpy).toHaveBeenLastCalledWith({ progress: 1 });
    });

    it('should support cancel before start', async () => {
        const file = new MockFile(new Uint8Array([0x61]));
        const task = createFileHashTask(file as unknown as File, 'md5');
        task.cancel();
        await expect(task.start()).rejects.toThrow('Task cancelled');
    });

    it('should throw for unsupported algorithm', () => {
        const file = new MockFile(new Uint8Array([0x61]));
        expect(() => createFileHashTask(file as unknown as File, 'sha3-256')).toThrow(
            'Unsupported hash algorithm'
        );
    });

    it('should return rejected promise when result() called before start()', async () => {
        const file = new MockFile(new Uint8Array([0x61]));
        const task = createFileHashTask(file as unknown as File, 'md5');
        await expect(task.result()).rejects.toThrow('Task not started');
    });
});
