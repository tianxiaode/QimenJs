import { HashTask } from '@/tasks/hash-task/hash/HashTask';
import { HashTaskOptions } from '@/tasks/hash-task/hash/HashTask'; // 从HashTask导入类型
import { HashTaskRunner } from '@/tasks/hash-task/hash/HashTaskRunner';
import { HashTaskState } from '@/tasks/hash-task/hash/HashTaskState';
import { HashTaskProgress } from '@/tasks/hash-task/hash/HashTaskProgress';
import { HashTaskResources } from '@/tasks/hash-task/hash/HashTaskResources';
import { WorkerPool } from '@/tasks/hash-task/worker';

// Mock dependencies
jest.useFakeTimers();
// 避免导入会触发HashWorker执行的模块
jest.mock('@/tasks/hash-task/hash/HashTaskRunner');
jest.mock('@/tasks/hash-task/hash/HashTaskState');
jest.mock('@/tasks/hash-task/hash/HashTaskProgress');
jest.mock('@/tasks/hash-task/hash/HashTaskResources');
// Mock WorkerScriptBuilder to avoid HashWorker execution
jest.mock('@/tasks/hash-task/worker', () => ({
  WorkerScriptBuilder: jest.fn(() => ({
    build: jest.fn(() => 'mock script')
  })),
  WorkerPool: jest.fn()
}));

describe('HashTask', () => {
    let hashTask: HashTask;
    let mockOptions: HashTaskOptions;
    let mockChunkProvider: any;
    let mockMemoryManager: any;
    let mockWorkerPool: WorkerPool;

    beforeEach(() => {
        mockChunkProvider = {
            getTotalSize: jest.fn(() => 1024),
        };
        
        mockMemoryManager = {};
        mockWorkerPool = {} as WorkerPool;
        
        mockOptions = {
            algorithm: 'sha256',
            chunkProvider: mockChunkProvider,
            memoryManager: mockMemoryManager,
            workerPool: mockWorkerPool,
        };
        
        (HashTaskRunner as jest.Mock).mockImplementation(() => ({
            run: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
            pause: jest.fn(),
            resume: jest.fn(),
            cancel: jest.fn(),
        }));
        
        hashTask = new HashTask(mockOptions);
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('constructor', () => {
        it('should initialize with provided options', () => {
            expect((hashTask as any).options).toBe(mockOptions);
        });

        it('should initialize progress with total size', () => {
            const initSpy = jest.spyOn((hashTask as any).progress, 'init');
            hashTask = new HashTask(mockOptions);
            
            expect(initSpy).toHaveBeenCalledWith(1024);
        });
    });

    describe('start', () => {
        it('should call runner.run() and start progress polling', () => {
            const runnerRunSpy = jest.spyOn((hashTask as any).runner, 'run');
            const startProgressPollingSpy = jest.spyOn(hashTask as any, 'startProgressPolling').mockImplementation();
            
            hashTask.start();
            
            expect(runnerRunSpy).toHaveBeenCalled();
            expect(startProgressPollingSpy).toHaveBeenCalled();
        });
    });

    describe('pause', () => {
        it('should call runner.pause()', () => {
            const runnerPauseSpy = jest.spyOn((hashTask as any).runner, 'pause');
            
            hashTask.pause();
            
            expect(runnerPauseSpy).toHaveBeenCalled();
        });
    });

    describe('resume', () => {
        it('should call runner.resume()', () => {
            const runnerResumeSpy = jest.spyOn((hashTask as any).runner, 'resume');
            
            hashTask.resume();
            
            expect(runnerResumeSpy).toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should call runner.cancel()', () => {
            const runnerCancelSpy = jest.spyOn((hashTask as any).runner, 'cancel');
            
            hashTask.cancel();
            
            expect(runnerCancelSpy).toHaveBeenCalled();
        });
    });

    describe('result', () => {
        it('should return the result promise', async () => {
            const resultPromise = hashTask.result();
            
            expect(resultPromise).toBeInstanceOf(Promise);
        });
    });

    describe('onProgress', () => {
        it('should add progress listener and return removal function', () => {
            const listener = jest.fn();
            const removeFn = hashTask.onProgress(listener);
            
            // Simulate triggering a progress update by calling the internal polling function
            const progressSnapshot = { progress: 0.5, processedBytes: 512, totalBytes: 1024, processedChunks: 1 };
            (hashTask as any).progress.snapshot = jest.fn(() => progressSnapshot);
            
            // Call the internal polling function to trigger listeners
            (hashTask as any).progressListeners.add(listener);
            (hashTask as any).startProgressPolling();
            
            // Simulate the timeout that would call the listeners
            jest.advanceTimersByTime(200);
            
            expect(listener).toHaveBeenCalledWith(progressSnapshot);
            
            // Test removal function
            expect((hashTask as any).progressListeners.has(listener)).toBe(true);
            removeFn();
            expect((hashTask as any).progressListeners.has(listener)).toBe(false);
        });
    });

    describe('startProgressPolling', () => {
        it('should poll and notify listeners', () => {
            const listener = jest.fn();
            hashTask.onProgress(listener);
            
            const progressSnapshot = { progress: 0.5, processedBytes: 512, totalBytes: 1024, processedChunks: 1 };
            (hashTask as any).progress.snapshot = jest.fn(() => progressSnapshot);
            
            (hashTask as any).startProgressPolling();
            
            // Advance timer to trigger the polling
            jest.advanceTimersByTime(200);
            
            expect(listener).toHaveBeenCalledWith(progressSnapshot);
        });

        it('should stop polling if task is completed', () => {
            // Set the state to completed
            (hashTask as any).state.value = 'completed';
            
            const listener = jest.fn();
            hashTask.onProgress(listener);
            
            (hashTask as any).startProgressPolling();
            
            // Advance timer to trigger the polling
            jest.advanceTimersByTime(200);
            
            expect(listener).not.toHaveBeenCalled();
        });

        it('should stop polling if task has failed', () => {
            // Set the state to failed
            (hashTask as any).state.value = 'failed';
            
            const listener = jest.fn();
            hashTask.onProgress(listener);
            
            (hashTask as any).startProgressPolling();
            
            // Advance timer to trigger the polling
            jest.advanceTimersByTime(200);
            
            expect(listener).not.toHaveBeenCalled();
        });

        it('should stop polling if task is cancelled', () => {
            // Set the state to cancelled
            (hashTask as any).state.value = 'cancelled';
            
            const listener = jest.fn();
            hashTask.onProgress(listener);
            
            (hashTask as any).startProgressPolling();
            
            // Advance timer to trigger the polling
            jest.advanceTimersByTime(200);
            
            expect(listener).not.toHaveBeenCalled();
        });
    });
});