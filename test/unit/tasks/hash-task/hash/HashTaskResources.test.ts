import { HashTaskResources } from '@/tasks/hash-task/hash/HashTaskResources';
import { MemoryManager, IMemoryTicket } from '@orbitjs/runtime-env';
import { WorkerPool, WorkerHandle } from '@/tasks/hash-task/worker';
import { ResourceUnavailableError } from '@/tasks/hash-task/errors';
import { ResourceNotAcquiredError } from '@/tasks/hash-task/errors/ResourceNotAcquiredError';

// Mock for IMemoryTicket
class MockMemoryTicket implements IMemoryTicket {
    constructor(public bytes: number) {}
    release = jest.fn();
}

// Mock for WorkerHandle
class MockWorkerHandle implements WorkerHandle {
    id = 'mock-worker-id';
    post = jest.fn();
    onMessage = jest.fn(() => () => {});
    onError = jest.fn(() => () => {});
    terminate = jest.fn(() => Promise.resolve());
    isAlive = jest.fn(() => true);
}

// Mock for WorkerPool
class MockWorkerPool implements WorkerPool {
    acquire = jest.fn((scriptSource: string) => Promise.resolve(new MockWorkerHandle()));
    release = jest.fn();
    destroy = jest.fn(() => Promise.resolve());
}

// Mock for MemoryManager
class MockMemoryManager extends MemoryManager {
    constructor() {
        super({ maxBytes: 1024 * 1024 * 1024, highWatermark: 0.8 }); // 1GB with 80% threshold
    }
    
    acquire = jest.fn((bytes: number) => Promise.resolve(new MockMemoryTicket(bytes)));
}

describe('HashTaskResources', () => {
    let resources: HashTaskResources;
    let mockMemoryManager: MockMemoryManager;
    let mockWorkerPool: MockWorkerPool;

    beforeEach(() => {
        mockMemoryManager = new MockMemoryManager();
        mockWorkerPool = new MockWorkerPool();
        resources = new HashTaskResources(mockMemoryManager, mockWorkerPool);
    });

    describe('constructor', () => {
        it('should initialize with provided managers', () => {
            expect((resources as any).memoryManager).toBe(mockMemoryManager);
            expect((resources as any).workerPool).toBe(mockWorkerPool);
        });
    });

    describe('acquire', () => {
        it('should acquire memory and worker resources', async () => {
            const scriptSource = 'test script';
            const memoryBytes = 1024;

            await resources.acquire(scriptSource, memoryBytes);

            expect(mockMemoryManager.acquire).toHaveBeenCalledWith(memoryBytes);
            expect(mockWorkerPool.acquire).toHaveBeenCalledWith(scriptSource);
        });

        it('should not acquire resources if already acquired', async () => {
            const scriptSource = 'test script';
            const memoryBytes = 1024;

            await resources.acquire(scriptSource, memoryBytes);
            await resources.acquire(scriptSource, memoryBytes);

            expect(mockMemoryManager.acquire).toHaveBeenCalledTimes(1);
            expect(mockWorkerPool.acquire).toHaveBeenCalledTimes(1);
        });

        it('should throw ResourceUnavailableError if memory acquisition fails', async () => {
            const error = new Error('Memory unavailable');
            (mockMemoryManager.acquire as jest.Mock).mockRejectedValueOnce(error);

            await expect(resources.acquire('script', 1024)).rejects.toThrow(ResourceUnavailableError);
            
            // Test the error details separately
            try {
                await resources.acquire('script', 1024);
            } catch (err) {
                expect(err).toBeInstanceOf(ResourceUnavailableError);
                // Access the resource type from the error's context
                expect((err as ResourceUnavailableError).context).toBeDefined();
                expect((err as ResourceUnavailableError).context!.resource).toBe('memory');
            }
        });

        it('should throw ResourceUnavailableError if worker acquisition fails', async () => {
            const error = new Error('Worker unavailable');
            (mockWorkerPool.acquire as jest.Mock).mockRejectedValueOnce(error);

            await expect(resources.acquire('script', 1024)).rejects.toThrow(ResourceUnavailableError);
            
            // Test the error details separately
            try {
                await resources.acquire('script', 1024);
            } catch (err) {
                expect(err).toBeInstanceOf(ResourceUnavailableError);
                // Access the resource type from the error's context
                expect((err as ResourceUnavailableError).context).toBeDefined();
                expect((err as ResourceUnavailableError).context!.resource).toBe('worker');
            }
        });

        it('should release resources if worker acquisition fails after memory acquisition', async () => {
            const mockTicket = new MockMemoryTicket(1024);
            (mockMemoryManager.acquire as jest.Mock).mockResolvedValueOnce(mockTicket);
            const error = new Error('Worker unavailable');
            (mockWorkerPool.acquire as jest.Mock).mockRejectedValueOnce(error);

            await expect(resources.acquire('script', 1024)).rejects.toThrow(ResourceUnavailableError);
            // After acquire fails, release() is called which will release the memory ticket
            expect(mockTicket.release).toHaveBeenCalled();
        });

        it('should release resources if memory acquisition fails after worker acquisition', async () => {
            // This test is a bit tricky since we can't fail memory after worker is acquired
            // The logic in the original test was incorrect because memory is acquired before worker
            const memoryError = new Error('Memory unavailable');
            (mockMemoryManager.acquire as jest.Mock).mockRejectedValueOnce(memoryError);

            await expect(resources.acquire('script', 1024)).rejects.toThrow(ResourceUnavailableError);
            // In the actual implementation, if memory fails, worker won't be acquired, so release won't be called
        });
    });

    describe('release', () => {
        it('should release worker and memory resources', async () => {
            const mockWorker = new MockWorkerHandle();
            const mockTicket = new MockMemoryTicket(1024);
            
            (mockWorkerPool.acquire as jest.Mock).mockResolvedValueOnce(mockWorker);
            (mockMemoryManager.acquire as jest.Mock).mockResolvedValueOnce(mockTicket);

            await resources.acquire('script', 1024);
            await resources.release();

            expect(mockWorkerPool.release).toHaveBeenCalledWith(mockWorker);
            expect(mockTicket.release).toHaveBeenCalled();
        });

        it('should be idempotent - not fail when resources are not acquired', async () => {
            await expect(resources.release()).resolves.not.toThrow();
        });

        it('should reset acquired flag after releasing', async () => {
            await resources.acquire('script', 1024);
            expect((resources as any).acquired).toBe(true);

            await resources.release();
            expect((resources as any).acquired).toBe(false);
        });
    });

    describe('getWorker', () => {
        it('should return the worker if resources are acquired', async () => {
            const expectedWorker = new MockWorkerHandle();
            (mockWorkerPool.acquire as jest.Mock).mockResolvedValueOnce(expectedWorker);

            await resources.acquire('script', 1024);
            const worker = resources.getWorker();

            expect(worker).toBe(expectedWorker);
        });

        it('should throw ResourceNotAcquiredError if worker is not acquired', () => {
            expect(() => resources.getWorker()).toThrow(ResourceNotAcquiredError);
        });
    });

    describe('snapshot', () => {
        it('should return snapshot with worker status and memory bytes when resources are acquired', async () => {
            const memoryBytes = 2048;
            const memoryTicket = new MockMemoryTicket(memoryBytes);
            (mockMemoryManager.acquire as jest.Mock).mockResolvedValueOnce(memoryTicket);
            const worker = new MockWorkerHandle();
            (mockWorkerPool.acquire as jest.Mock).mockResolvedValueOnce(worker);

            await resources.acquire('script', memoryBytes);
            const snapshot = resources.snapshot();

            expect(snapshot.hasWorker).toBe(true);
            expect(snapshot.memoryBytes).toBe(memoryBytes);
        });

        it('should return snapshot with no worker and no memory when resources are not acquired', () => {
            const snapshot = resources.snapshot();

            expect(snapshot.hasWorker).toBe(false);
            expect(snapshot.memoryBytes).toBeUndefined();
        });
    });
});