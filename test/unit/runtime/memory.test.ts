import { MemoryManager, MemoryTicket, IMemoryTicket } from '@/runtime';

describe('MemoryManager', () => {
    const maxBytes = 100;
    const highWatermark = 80;
    let manager: MemoryManager;

    beforeEach(() => {
        manager = new MemoryManager({ maxBytes, highWatermark });
    });

    describe('constructor', () => {
        it('should initialize with correct values', () => {
            expect(manager.snapshot().max).toBe(maxBytes);
            expect(manager.snapshot().highWatermark).toBe(highWatermark);
            expect(manager.snapshot().used).toBe(0);
        });

        it('should use default highWatermark when not provided', () => {
            const defaultManager = new MemoryManager({ maxBytes: 100 });
            expect(defaultManager.snapshot().highWatermark).toBe(80); // 100 * 0.8
        });
    });

    describe('acquire', () => {
        it('should acquire memory and return a ticket', async () => {
            const ticket = await manager.acquire(10);
            expect(ticket).toBeDefined();
            expect(ticket.bytes).toBe(10);
            expect(manager.snapshot().used).toBe(10);
        });

        it('should throw error when requested bytes exceed max', async () => {
            await expect(manager.acquire(200)).rejects.toThrow(
                'Request 200 exceeds max memory 100'
            );
        });

        it('should block when not enough memory available and then allow when memory is freed', async () => {
            // 占用全部内存
            const ticket = await manager.acquire(100);
            expect(manager.snapshot().used).toBe(100);

            // 尝试获取更多内存，这应该会阻塞
            const acquirePromise = manager.acquire(10);

            // 确保获取操作被阻塞
            let resolved = false;
            acquirePromise.then(() => (resolved = true));
            await new Promise(resolve => setTimeout(resolve, 10)); // 短暂延迟
            expect(resolved).toBe(false); // 应该还未解析

            // 释放一些内存，使等待的操作能够完成
            ticket.release(); // 释放100字节内存

            // 现在获取操作应该能完成
            const newTicket = await acquirePromise;
            expect(newTicket.bytes).toBe(10);
            expect(manager.snapshot().used).toBe(10);
        });
    });

    describe('release', () => {
        it('should release memory correctly', () => {
            const initialUsed = manager.snapshot().used;
            const ticket = manager.acquire(20) as unknown as Promise<IMemoryTicket>;
            ticket.then(t => {
                t.release();
                expect(manager.snapshot().used).toBe(initialUsed);
            });
        });

        it('should not allow negative used memory', () => {
            manager['used'] = 10; // 使用索引签名访问私有属性
            manager.release(20); // 释放比已用更多的内存
            expect(manager.snapshot().used).toBe(0);
        });
    });

    describe('snapshot', () => {
        it('should return correct snapshot', () => {
            const snapshot = manager.snapshot();
            expect(snapshot.used).toBe(0);
            expect(snapshot.max).toBe(maxBytes);
            expect(snapshot.highWatermark).toBe(highWatermark);
        });

        it('should reflect changes in memory usage', async () => {
            await manager.acquire(50);
            const snapshot = manager.snapshot();
            expect(snapshot.used).toBe(50);
            expect(snapshot.max).toBe(maxBytes);
            expect(snapshot.highWatermark).toBe(highWatermark);
        });
    });
});

describe('MemoryTicket', () => {
    let manager: MemoryManager;

    beforeEach(() => {
        manager = new MemoryManager({ maxBytes: 100, highWatermark: 80 });
    });

    it('should track bytes correctly', async () => {
        const ticket = await manager.acquire(25);
        expect(ticket.bytes).toBe(25);
    });

    it('should release memory when release is called', async () => {
        const initialSnapshot = manager.snapshot();
        const ticket = await manager.acquire(30);
        expect(manager.snapshot().used).toBe(initialSnapshot.used + 30);

        ticket.release();
        expect(manager.snapshot().used).toBe(initialSnapshot.used);
    });

    it('should not release memory multiple times', async () => {
        const initialSnapshot = manager.snapshot();
        const ticket = await manager.acquire(20);
        expect(manager.snapshot().used).toBe(initialSnapshot.used + 20);

        ticket.release();
        expect(manager.snapshot().used).toBe(initialSnapshot.used);

        // 再次调用release应该没有效果
        ticket.release();
        expect(manager.snapshot().used).toBe(initialSnapshot.used);
    });
});
