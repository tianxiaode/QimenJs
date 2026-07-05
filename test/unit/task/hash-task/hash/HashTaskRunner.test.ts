import { HashTaskRunner } from '@/task/hash-task/hash/HashTaskRunner';
import { HashTaskState } from '@/task/hash-task/hash/HashTaskState';
import { HashTaskProgress } from '@/task/hash-task/hash/HashTaskProgress';
import { HashTaskOptions } from '@/task/hash-task/hash/HashTask'; // 从HashTask导入类型
import { Chunk } from '@/task/hash-task/types';
import { WorkerHandle, WorkerScriptBuilder } from '@/task/hash-task/worker';
import { HashTaskHealthMonitor } from '@/task/hash-task/hash/HashTaskHealthMonitor';

// Mock dependencies
// 避免导入会触发HashWorker执行的模块
jest.mock('@/task/hash-task/worker', () => ({
    WorkerScriptBuilder: jest.fn(() => ({
        build: jest.fn(() => 'mock script'),
    })),
    WorkerHandle: jest.fn(),
    WorkerPool: jest.fn(),
}));
jest.mock('@/task/hash-task/hash/HashTaskHealthMonitor');
// Mock logger to prevent errors
jest.mock('@qimenjs/logger', () => ({
    Logger: {
        for: jest.fn(() => ({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        })),
    },
    ILogger: jest.fn(),
}));

// 创建Mock HashTaskResources
class MockHashTaskResources {
    private mockWorker: any;
    private acquired = false;

    constructor(worker?: any) {
        this.mockWorker = worker;
    }

    acquire = jest.fn();
    release = jest.fn();
    getWorker = jest.fn(() => this.mockWorker);
    snapshot = jest.fn();
}

describe('HashTaskRunner', () => {
    let runner: HashTaskRunner;
    let state: HashTaskState;
    let progress: HashTaskProgress;
    let resources: MockHashTaskResources;
    let mockOptions: HashTaskOptions;
    let mockWorker: any;
    let mockChunkProvider: any;

    beforeEach(() => {
        state = new HashTaskState();
        progress = new HashTaskProgress();
        mockWorker = {
            post: jest.fn(),
            onMessage: jest.fn(() => () => {}),
        };
        resources = new MockHashTaskResources(mockWorker);

        mockChunkProvider = {
            getTotalSize: jest.fn(() => 1000),
            getChunkSize: jest.fn(() => 512),
            hasNext: jest.fn(() => false),
            next: jest.fn(() => Promise.resolve(null)),
        };

        mockOptions = {
            algorithm: 'sha256',
            chunkProvider: mockChunkProvider,
            memoryManager: {} as any,
            workerPool: {} as any,
        };

        runner = new HashTaskRunner(state, progress, resources as any, mockOptions);
    });

    describe('constructor', () => {
        it('should initialize with provided dependencies', () => {
            expect((runner as any).state).toBe(state);
            expect((runner as any).progress).toBe(progress);
            expect((runner as any).resources).toBe(resources);
            expect((runner as any).options).toBe(mockOptions);
        });
    });

    describe('run', () => {
        it('should acquire resources, execute hashing, and release resources', async () => {
            const mockScriptSource = 'mock script';
            const mockBuilder = new WorkerScriptBuilder();
            jest.spyOn(mockBuilder, 'build').mockReturnValue(mockScriptSource);
            (runner as any).builder = mockBuilder;

            const mockMemoryRequired = 2048;
            jest.spyOn(runner as any, 'calculateRequiredMemory').mockReturnValue(
                mockMemoryRequired
            );

            jest.spyOn(resources, 'acquire').mockResolvedValue(undefined);
            jest.spyOn(resources, 'release').mockResolvedValue(undefined);
            jest.spyOn(runner as any, 'executeHashing').mockResolvedValue(new ArrayBuffer(0));

            const healthMonitorMock = {
                start: jest.fn(),
                stop: jest.fn(),
            };
            (HashTaskHealthMonitor as jest.Mock).mockImplementation(() => healthMonitorMock);

            await runner.run();

            expect(resources.acquire).toHaveBeenCalledWith(mockScriptSource, mockMemoryRequired);
            expect(resources.release).toHaveBeenCalled();
            expect(healthMonitorMock.start).toHaveBeenCalled();
            expect(healthMonitorMock.stop).toHaveBeenCalled();
        });

        it('should start the task state', async () => {
            const mockScriptSource = 'mock script';
            const mockBuilder = new WorkerScriptBuilder();
            jest.spyOn(mockBuilder, 'build').mockReturnValue(mockScriptSource);
            (runner as any).builder = mockBuilder;

            const mockMemoryRequired = 2048;
            jest.spyOn(runner as any, 'calculateRequiredMemory').mockReturnValue(
                mockMemoryRequired
            );

            jest.spyOn(resources, 'acquire').mockResolvedValue(undefined);
            jest.spyOn(resources, 'release').mockResolvedValue(undefined);
            jest.spyOn(runner as any, 'executeHashing').mockResolvedValue(new ArrayBuffer(0));

            const healthMonitorMock = {
                start: jest.fn(),
                stop: jest.fn(),
            };
            (HashTaskHealthMonitor as jest.Mock).mockImplementation(() => healthMonitorMock);

            state['status'] = 'idle';
            await runner.run();

            expect(state.value).toBe('running');
        });
    });

    describe('pause', () => {
        it('should pause the task if state allows pausing', () => {
            state['status'] = 'running' as any;
            jest.spyOn(state, 'pause');

            runner.pause();

            expect(state.pause).toHaveBeenCalled();
        });

        it('should not pause the task if state does not allow pausing', () => {
            state['status'] = 'idle' as any;
            jest.spyOn(state, 'pause');

            runner.pause();

            expect(state.pause).not.toHaveBeenCalled();
        });
    });

    describe('resume', () => {
        it('should resume the task if state allows resuming', () => {
            state['status'] = 'paused' as any;
            jest.spyOn(state, 'resume');

            runner.resume();

            expect(state.resume).toHaveBeenCalled();
        });

        it('should not resume the task if state does not allow resuming', () => {
            state['status'] = 'idle' as any;
            jest.spyOn(state, 'resume');

            runner.resume();

            expect(state.resume).not.toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should cancel the task if state allows canceling', () => {
            state['status'] = 'running' as any;
            jest.spyOn(state, 'cancel');

            runner.cancel();

            expect(state.cancel).toHaveBeenCalled();
        });

        it('should not cancel the task if state does not allow canceling', () => {
            state['status'] = 'idle' as any;
            jest.spyOn(state, 'cancel');

            runner.cancel();

            expect(state.cancel).not.toHaveBeenCalled();
        });
    });

    describe('waitIfPaused', () => {
        it('should wait if task is paused', async () => {
            state['status'] = 'paused' as any;

            // Mock setTimeout to immediately resolve
            const originalSetTimeout = setTimeout;
            const setTimeoutSpy = jest
                .spyOn(global, 'setTimeout')
                .mockImplementation((fn, delay) => {
                    originalSetTimeout(fn, 1); // Use 1ms instead of actual delay
                    return {} as any;
                });

            // We'll test this by simulating the state change after a timeout
            const waitPromise = (runner as any).waitIfPaused();

            // Change state to running after a "delay"
            setTimeout(() => {
                state['status'] = 'running' as any;
            }, 10);

            await waitPromise;

            setTimeoutSpy.mockRestore();
        });

        it('should not wait if task is not paused', async () => {
            state['status'] = 'running' as any;

            await expect((runner as any).waitIfPaused()).resolves.not.toThrow();
        });
    });

    describe('runChunk', () => {
        it('should send chunk to worker and wait for acknowledgment', async () => {
            const mockChunk: Chunk = { id: 'test-chunk', data: new ArrayBuffer(10) };
            const mockHandler = jest.fn();
            mockWorker.onMessage = jest.fn(handler => {
                mockHandler.mockImplementation(handler);
                return () => {};
            });

            const runChunkPromise = (runner as any).runChunk(mockWorker, mockChunk);

            // Simulate receiving an acknowledgment
            mockHandler({ type: 'ack', chunkId: mockChunk.id });

            await expect(runChunkPromise).resolves.not.toThrow();
            expect(mockWorker.post).toHaveBeenCalledWith(
                { type: 'update', chunkId: mockChunk.id, data: mockChunk.data },
                [mockChunk.data]
            );
        });

        it('should reject if worker sends error', async () => {
            const mockChunk: Chunk = { id: 'test-chunk', data: new ArrayBuffer(10) };
            const mockHandler = jest.fn();
            mockWorker.onMessage = jest.fn(handler => {
                mockHandler.mockImplementation(handler);
                return () => {};
            });

            const runChunkPromise = (runner as any).runChunk(mockWorker, mockChunk);

            // Simulate receiving an error
            mockHandler({ type: 'error', message: 'Test error' });

            await expect(runChunkPromise).rejects.toThrow('Test error');
        });
    });

    describe('finalize', () => {
        it('should send final message to worker and wait for digest', async () => {
            const mockResult = new ArrayBuffer(10);
            const mockHandler = jest.fn();
            mockWorker.onMessage = jest.fn(handler => {
                mockHandler.mockImplementation(handler);
                return () => {};
            });

            const finalizePromise = (runner as any).finalize(mockWorker);

            // Simulate receiving digest
            mockHandler({ type: 'digest', result: mockResult });

            await expect(finalizePromise).resolves.toBe(mockResult);
            expect(mockWorker.post).toHaveBeenCalledWith({ type: 'final' });
        });
    });

    describe('calculateRequiredMemory', () => {
        it('should calculate memory based on chunk size', () => {
            const chunkSize = 1024;
            mockChunkProvider.getChunkSize = jest.fn(() => chunkSize);

            const requiredMemory = (runner as any).calculateRequiredMemory();

            // Expected: chunkSize * 2 + 1024 * 1024
            expect(requiredMemory).toBe(chunkSize * 2 + 1024 * 1024);
        });
    });

    describe('executeHashing', () => {
        it('should execute hashing successfully with chunks', async () => {
            // Mock progress.onChunk to track calls
            const onChunkSpy = jest.spyOn(progress, 'onChunk').mockImplementation(() => {});

            // Setup chunk provider to return chunks
            const mockChunks = [
                { id: 'chunk1', data: new ArrayBuffer(10) },
                { id: 'chunk2', data: new ArrayBuffer(10) },
            ];
            const chunkIndex = 0;

            mockChunkProvider.hasNext = jest
                .fn()
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false); // Return false on third call
            mockChunkProvider.next = jest
                .fn()
                .mockResolvedValueOnce(mockChunks[0])
                .mockResolvedValueOnce(mockChunks[1])
                .mockResolvedValue(null);

            // Mock the runChunk and finalize methods
            const runChunkSpy = jest
                .spyOn(runner as any, 'runChunk')
                .mockImplementation(() => Promise.resolve());
            const finalizeSpy = jest
                .spyOn(runner as any, 'finalize')
                .mockResolvedValue(new ArrayBuffer(16));

            // Mock state.canPause and state.complete - set status to 'running' first
            state['status'] = 'running';
            jest.spyOn(state, 'canPause').mockReturnValue(true);
            const completeSpy = jest.spyOn(state, 'complete');

            // Execute the method
            const result = await (runner as any).executeHashing();

            // Verify the calls
            expect(mockChunkProvider.next).toHaveBeenCalledTimes(2);
            expect(runChunkSpy).toHaveBeenCalledTimes(2);
            expect(runChunkSpy).toHaveBeenCalledWith(mockWorker, mockChunks[0]);
            expect(runChunkSpy).toHaveBeenCalledWith(mockWorker, mockChunks[1]);
            expect(finalizeSpy).toHaveBeenCalledWith(mockWorker);
            expect(onChunkSpy).toHaveBeenCalledTimes(2);
            expect(completeSpy).toHaveBeenCalled();
        });

        it('should throw error when task is cancelled', async () => {
            // Setup chunk provider to return a chunk
            const mockChunk = { id: 'chunk1', data: new ArrayBuffer(10) };

            mockChunkProvider.hasNext = jest.fn().mockReturnValue(true);
            mockChunkProvider.next = jest.fn().mockResolvedValue(mockChunk);

            // Mock state to return 'cancelled' when isCancelled is called
            jest.spyOn(state, 'isCancelled').mockReturnValue(true);

            await expect((runner as any).executeHashing()).rejects.toThrow('Task cancelled');
        });

        it('should handle error in runChunk and propagate it', async () => {
            // Setup chunk provider
            const mockChunk = { id: 'chunk1', data: new ArrayBuffer(10) };

            mockChunkProvider.hasNext = jest.fn().mockReturnValueOnce(true);
            mockChunkProvider.next = jest.fn().mockResolvedValue(mockChunk);

            // Mock runChunk to throw an error
            jest.spyOn(runner as any, 'runChunk').mockRejectedValue(new Error('Worker error'));

            await expect((runner as any).executeHashing()).rejects.toThrow('Worker error');
        });
    });

    describe('run with error handling', () => {
        it('should catch error from executeHashing and re-throw it', async () => {
            const mockScriptSource = 'mock script';
            const mockBuilder = new WorkerScriptBuilder();
            jest.spyOn(mockBuilder, 'build').mockReturnValue(mockScriptSource);
            (runner as any).builder = mockBuilder;

            const mockMemoryRequired = 2048;
            jest.spyOn(runner as any, 'calculateRequiredMemory').mockReturnValue(
                mockMemoryRequired
            );

            jest.spyOn(resources, 'acquire').mockResolvedValue(undefined);
            jest.spyOn(resources, 'release').mockResolvedValue(undefined);
            // Mock executeHashing to throw an error
            jest.spyOn(runner as any, 'executeHashing').mockRejectedValue(new Error('Test error'));

            const healthMonitorMock = {
                start: jest.fn(),
                stop: jest.fn(),
            };
            (HashTaskHealthMonitor as jest.Mock).mockImplementation(() => healthMonitorMock);

            await expect(runner.run()).rejects.toThrow('Test error');
            expect(healthMonitorMock.stop).toHaveBeenCalled();
            expect(resources.release).toHaveBeenCalled();
        });
    });
});
