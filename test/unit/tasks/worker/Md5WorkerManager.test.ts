import { Md5WorkerManager } from '@/tasks/worker/Md5WorkerManager';

// Mock Worker
class MockWorker {
  onmessage: (event: MessageEvent) => void = () => {};
  onerror: (event: MessageEvent) => void = () => {};
  onmessageerror: (event: MessageEvent) => void = () => {};
  postMessage = jest.fn();
  terminate = jest.fn();

  constructor(public scriptURL: string) {}
}

// 保存原始Worker
const originalWorker = window.Worker;

describe('Md5WorkerManager', () => {
  let md5WorkerManager: Md5WorkerManager;
  let mockFile: File;

  beforeAll(() => {
    // 替换Worker为Mock
    (window as any).Worker = MockWorker;
  });

  afterAll(() => {
    // 恢复原始Worker
    (window as any).Worker = originalWorker;
  });

  beforeEach(() => {
    md5WorkerManager = new Md5WorkerManager();
    
    // 创建一个mock文件
    mockFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
  });

  afterEach(() => {
    md5WorkerManager.stop();
  });

  describe('constructor', () => {
    it('should initialize with correct worker URL', () => {
      // 通过检查内部worker实例来验证
      md5WorkerManager['start'](); // 调用私有方法启动worker
      const worker = md5WorkerManager['worker'];
      expect(worker).toBeInstanceOf(MockWorker);
    });
  });

  describe('calculate', () => {
    it('should start the worker and post start message when calculate is called', async () => {
      const promise = md5WorkerManager.calculate(mockFile);
      
      // 模拟完成消息
      const doneEvent = new MessageEvent('message', {
        data: { type: 'done', hash: '5d41402abc4b2a76b9719d911017c592' }
      });
      
      // 触发worker的onmessage
      md5WorkerManager['worker']!.onmessage!(doneEvent);
      
      const result = await promise;
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('should handle progress events', (done) => {
      md5WorkerManager.onProgress = (progress) => {
        expect(progress.loaded).toBe(5);
        expect(progress.total).toBe(11);
        done();
      };

      md5WorkerManager.calculate(mockFile);
      
      // 模拟进度消息
      const progressEvent = new MessageEvent('message', {
        data: { type: 'progress', loaded: 5, total: 11 }
      });
      
      md5WorkerManager['worker']!.onmessage!(progressEvent);
    });

    it('should handle error events', (done) => {
      md5WorkerManager.calculate(mockFile)
        .catch(error => {
          expect(error).toBe('An error occurred');
          done();
        });
      
      // 模拟错误消息
      const errorEvent = new MessageEvent('message', {
        data: { type: 'error', error: 'An error occurred' }
      });
      
      md5WorkerManager['worker']!.onmessage!(errorEvent);
    });

    it('should handle cancellation events', (done) => {
      md5WorkerManager.calculate(mockFile)
        .catch(error => {
          expect(error.message).toBe('MD5 calculation was cancelled');
          done();
        });
      
      // 模拟取消消息
      const cancelEvent = new MessageEvent('message', {
        data: { type: 'cancelled' }
      });
      
      md5WorkerManager['worker']!.onmessage!(cancelEvent);
    });
  });

  describe('cancel', () => {
    it('should post cancel message to worker', () => {
      md5WorkerManager.start();
      md5WorkerManager.cancel();
      
      expect(md5WorkerManager['worker']!.postMessage).toHaveBeenCalledWith({ type: 'cancel' });
    });
  });

  describe('onMessage', () => {
    it('should handle done message correctly', () => {
      const mockResolve = jest.fn();
      md5WorkerManager['resolve'] = mockResolve;

      const doneEvent = new MessageEvent('message', {
        data: { type: 'done', hash: '5d41402abc4b2a76b9719d911017c592' }
      });

      md5WorkerManager['onMessage'](doneEvent);

      expect(mockResolve).toHaveBeenCalledWith('5d41402abc4b2a76b9719d911017c592');
      expect(md5WorkerManager['worker']).toBeNull(); // worker should be stopped
    });

    it('should handle error message correctly', () => {
      const mockReject = jest.fn();
      md5WorkerManager['reject'] = mockReject;

      const errorEvent = new MessageEvent('message', {
        data: { type: 'error', error: 'An error occurred' }
      });

      md5WorkerManager['onMessage'](errorEvent);

      expect(mockReject).toHaveBeenCalledWith('An error occurred');
      expect(md5WorkerManager['worker']).toBeNull(); // worker should be stopped
    });

    it('should handle cancelled message correctly', () => {
      const mockReject = jest.fn();
      md5WorkerManager['reject'] = mockReject;

      const cancelEvent = new MessageEvent('message', {
        data: { type: 'cancelled' }
      });

      md5WorkerManager['onMessage'](cancelEvent);

      expect(mockReject).toHaveBeenCalledWith(new Error('MD5 calculation was cancelled'));
      expect(md5WorkerManager['worker']).toBeNull(); // worker should be stopped
    });
  });
});