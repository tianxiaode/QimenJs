import { WorkerManagerBase } from '@/task/worker/WorkerManagerBase';

// 创建一个WorkerManagerBase的测试子类
class TestWorkerManager extends WorkerManagerBase {
  // 添加一个public方法来访问post方法，以便测试
  public postMessage(data: any) {
    this.post(data);
  }

  protected onMessage(event: MessageEvent): void {
    // 模拟处理消息
  }

  protected onError(error: ErrorEvent): void {
    // 模拟处理错误
  }
}

describe('WorkerManagerBase', () => {
  let workerManager: TestWorkerManager;
  const mockWorkerUrl = '/mock/worker.js';

  beforeEach(() => {
    // 模拟Worker构造函数
    (window as any).Worker = jest.fn(() => ({
      postMessage: jest.fn(),
      onmessage: null,
      onerror: null,
      terminate: jest.fn(),
    }));

    workerManager = new TestWorkerManager(mockWorkerUrl);
    workerManager.start(); // 调用start方法初始化worker
  });

  afterEach(() => {
    workerManager.stop();
    (window as any).Worker = undefined;
  });

  describe('constructor', () => {
    it('should create a Worker instance with the provided URL', () => {
      expect((window as any).Worker).toHaveBeenCalledWith(mockWorkerUrl);
    });

    it('should initialize the worker property', () => {
      expect((workerManager as any).worker).toBeDefined();
      expect((workerManager as any).worker.postMessage).toBeDefined();
      expect((workerManager as any).worker.terminate).toBeDefined();
    });
  });

  describe('postMessage', () => {
    it('should send data to the worker using postMessage', () => {
      const testData = { action: 'test', data: 'value' };
      const postMessageSpy = jest.spyOn((workerManager as any).worker, 'postMessage');

      workerManager.postMessage(testData);

      expect(postMessageSpy).toHaveBeenCalledWith(testData);
    });
  });

  describe('stop', () => {
    it('should terminate the worker', () => {
      const terminateSpy = jest.spyOn((workerManager as any).worker, 'terminate');

      workerManager.stop();

      expect(terminateSpy).toHaveBeenCalled();
    });

    it('should not throw an error if worker is already terminated', () => {
      workerManager.stop();
      expect(() => workerManager.stop()).not.toThrow();
    });
  });

  describe('message handling', () => {
    it('should set onmessage handler', () => {
      const mockHandler = jest.fn();
      (workerManager as any).worker.onmessage = mockHandler;

      expect((workerManager as any).worker.onmessage).toBe(mockHandler);
    });

    it('should set onerror handler', () => {
      const mockHandler = jest.fn();
      (workerManager as any).worker.onerror = mockHandler;

      expect((workerManager as any).worker.onerror).toBe(mockHandler);
    });
  });
});