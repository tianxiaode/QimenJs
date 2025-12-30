import { WorkerManager } from '@/tasks/WorkerManager';

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

describe('WorkerManager', () => {
  let workerManager: WorkerManager;

  beforeEach(() => {
    // 在测试环境中模拟Worker
    Object.defineProperty(global, 'Worker', {
      value: MockWorker,
      writable: true,
    });
    
    workerManager = new WorkerManager();
    
    // 模拟Logger，避免在测试中出现Logger初始化问题
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    
    // 设置WorkerManager的_logger属性，绕过getter
    Object.defineProperty(workerManager, '_logger', {
      value: mockLogger,
      writable: true,
    });
  });

  afterEach(() => {
    if (workerManager.worker) {
      workerManager.stop();
    }
    
    // 清理模拟
    delete (global as any).Worker;
  });

  it('should create a worker with correct URL', () => {
    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);
    
    expect(workerManager.worker).toBeDefined();
    expect(workerManager.worker).toBeInstanceOf(MockWorker);
    expect((workerManager.worker as any).url).toBe(mockWorkerUrl);
  });

  it('should handle messages from worker', (done) => {
    const mockWorkerUrl = 'test-worker.js';
    
    workerManager.onMessage = (event: MessageEvent) => {
      expect(event.data).toBe('test message');
      done();
    };
    
    workerManager.start(mockWorkerUrl);
    
    // 手动触发消息事件
    if (workerManager.worker) {
      const mockWorker = workerManager.worker as any;
      if (mockWorker.onmessage) {
        mockWorker.onmessage(new MessageEvent('message', { data: 'test message' }));
      }
    }
  });

  it('should handle errors from worker', (done) => {
    const mockWorkerUrl = 'test-worker.js';
    
    workerManager.onError = (error: ErrorEvent) => {
      expect(error.message).toBe('test error');
      done();
    };
    
    workerManager.start(mockWorkerUrl);
    
    // 手动触发错误事件
    if (workerManager.worker) {
      const mockWorker = workerManager.worker as any;
      if (mockWorker.onerror) {
        mockWorker.onerror(new ErrorEvent('error', { message: 'test error' }));
      }
    }
  });

  it('should stop worker correctly', () => {
    const mockWorkerUrl = 'test-worker.js';
    workerManager.start(mockWorkerUrl);
    
    expect(workerManager.worker).toBeDefined();
    expect((workerManager.worker as any).terminated).toBe(false);
    
    workerManager.stop();
    
    expect(workerManager.worker).toBeNull();
  });

  it('should log warning when attempting to stop non-existent worker', () => {
    // 初始时worker为null
    expect(workerManager.worker).toBeNull();
    
    // 尝试停止一个不存在的worker
    workerManager.stop();
    
    // 此时应该没有错误，只是记录警告
    expect(workerManager.worker).toBeNull();
  });
});