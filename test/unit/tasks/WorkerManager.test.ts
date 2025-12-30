import { WorkerManager } from '@/tasks/WorkerManager';
import { WorkerError } from '@/tasks/errors/WorkerError';

// 模拟Logger
const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 模拟Logger.for方法
jest.mock('@/logger', () => ({
  Logger: {
    for: jest.fn(() => mockLogger),
  },
}));

// 模拟Worker类
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  terminated = false;

  constructor(public url: string) {}

  postMessage(message: any) {
    if (!this.terminated) {
      // 模拟消息处理
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', { data: message }));
        }
      }, 0);
    }
  }

  terminate() {
    this.terminated = true;
  }
}

// 模拟无法创建Worker的情况
class FailingMockWorker {
  constructor(_url: string) {
    throw new Error('Failed to create worker');
  }
}

describe('WorkerManager', () => {
  let workerManager: WorkerManager;

  beforeEach(() => {
    // 在测试环境中模拟Worker
    Object.defineProperty(global, 'Worker', {
      value: MockWorker,
      writable: true,
    });
  });

  afterEach(() => {
    // 清理模拟
    delete (global as any).Worker;
    jest.clearAllMocks();
  });

  it('should create a worker with correct URL', () => {
    workerManager = new WorkerManager();
    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);

    expect(workerManager.worker).toBeDefined();
    expect(workerManager.worker).toBeInstanceOf(MockWorker);
    expect((workerManager.worker as any).url).toBe(mockWorkerUrl);
    expect(mockLogger.info).toHaveBeenCalledWith(`Worker started: ${mockWorkerUrl}`);
  });

  it('should handle messages from worker with callback', (done) => {
    workerManager = new WorkerManager({
      onMessage: (event: MessageEvent) => {
        expect(event.data).toBe('test message');
        done();
      }
    });

    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);

    // 手动触发消息事件
    if (workerManager.worker) {
      const mockWorker = workerManager.worker as any;
      if (mockWorker.onmessage) {
        mockWorker.onmessage(new MessageEvent('message', { data: 'test message' }));
      }
    }
  });

  it('should handle errors from worker with callback', (done) => {
    workerManager = new WorkerManager({
      onError: (error: ErrorEvent) => {
        expect(error.message).toBe('test error');
        done();
      }
    });

    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);

    // 手动触发错误事件
    if (workerManager.worker) {
      const mockWorker = workerManager.worker as any;
      if (mockWorker.onerror) {
        mockWorker.onerror(new ErrorEvent('error', { message: 'test error' }));
      }
    }
  });

  it('should handle message errors from worker with callback', (done) => {
    workerManager = new WorkerManager({
      onMessageError: (error: MessageEvent) => {
        expect(error.data).toBe('message error');
        done();
      }
    });

    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);

    // 手动触发消息错误事件
    if (workerManager.worker) {
      const mockWorker = workerManager.worker as any;
      if (mockWorker.onmessageerror) {
        mockWorker.onmessageerror(new MessageEvent('messageerror', { data: 'message error' }));
      }
    }
  });

  it('should stop worker correctly', () => {
    workerManager = new WorkerManager();
    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);

    expect(workerManager.worker).toBeDefined();
    expect((workerManager.worker as any).terminated).toBe(false);

    workerManager.stop();

    expect(workerManager.worker).toBeNull();
    expect(mockLogger.info).toHaveBeenCalledWith('Worker terminated');
  });

  it('should log warning when attempting to stop non-existent worker', () => {
    workerManager = new WorkerManager();

    // 初始时worker为null
    expect(workerManager.worker).toBeNull();

    // 尝试停止一个不存在的worker
    workerManager.stop();

    // 此时应该记录警告
    expect(mockLogger.warn).toHaveBeenCalledWith('Attempted to stop non-existent worker');
    expect(workerManager.worker).toBeNull();
  });

  it('should post message to worker correctly', () => {
    workerManager = new WorkerManager();
    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);

    const testMessage = { type: 'TEST', payload: 'data' };
    workerManager.postMessage(testMessage);

    // 验证日志记录
    expect(mockLogger.debug).toHaveBeenCalledWith('Message posted to worker:', testMessage);
  });

  it('should log warning when attempting to post message to non-existent worker', () => {
    workerManager = new WorkerManager();

    // 初始时worker为null
    expect(workerManager.worker).toBeNull();

    const testMessage = { type: 'TEST', payload: 'data' };
    workerManager.postMessage(testMessage);

    // 此时应该记录警告
    expect(mockLogger.warn).toHaveBeenCalledWith('Attempted to post message to non-existent worker');
  });

  it('should throw WorkerError when failing to start worker', () => {
    Object.defineProperty(global, 'Worker', {
      value: FailingMockWorker,
      writable: true,
    });

    workerManager = new WorkerManager();
    const mockWorkerUrl = 'failing-worker.js';

    expect(() => {
      workerManager.start(mockWorkerUrl);
    }).toThrow(WorkerError);

    // 检查错误是否包含预期的上下文信息
    try {
      workerManager.start(mockWorkerUrl);
    } catch (error: any) {
      expect(error).toBeInstanceOf(WorkerError);
      expect(error.code).toBe('WORKER_ERROR');
      expect(error.context).toBeDefined();
      expect(error.context?.url).toBe(mockWorkerUrl);
      expect(error.context?.originalError).toBe('Failed to create worker');
    }

    // 检查是否记录了错误日志
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to start worker: ${mockWorkerUrl}`,
      expect.any(Error)
    );
  });
});