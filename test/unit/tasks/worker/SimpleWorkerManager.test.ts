import { SimpleWorkerManager } from '@/tasks/worker/SimpleWorkerManager';
import { WorkerManagerOptions } from '@/tasks/worker/types';

// Mock Worker
class MockWorker {
  onmessage: (event: MessageEvent) => void = () => {};
  onerror: (event: ErrorEvent) => void = () => {};
  onmessageerror: (event: MessageEvent) => void = () => {};
  postMessage = jest.fn();
  terminate = jest.fn();

  constructor(public scriptURL: string) {}
}

// 保存原始Worker
const originalWorker = window.Worker;

describe('SimpleWorkerManager', () => {
  let mockHandlers: WorkerManagerOptions;
  let simpleWorkerManager: SimpleWorkerManager;

  beforeAll(() => {
    // 替换Worker为Mock
    (window as any).Worker = MockWorker;
  });

  afterAll(() => {
    // 恢复原始Worker
    (window as any).Worker = originalWorker;
  });

  beforeEach(() => {
    mockHandlers = {
      onMessage: jest.fn(),
      onError: jest.fn(),
      onMessageError: jest.fn()
    };
    
    simpleWorkerManager = new SimpleWorkerManager('./test-worker.js', mockHandlers);
  });

  afterEach(() => {
    simpleWorkerManager.stop();
  });

  describe('constructor', () => {
    it('should initialize with correct worker URL and handlers', () => {
      expect(simpleWorkerManager).toBeInstanceOf(SimpleWorkerManager);
    });
  });

  describe('onMessage', () => {
    it('should call the onMessage handler when a message is received', () => {
      const mockEvent = new MessageEvent('message', { data: 'test data' });
      
      simpleWorkerManager['onMessage'](mockEvent);
      
      expect(mockHandlers.onMessage).toHaveBeenCalledWith(mockEvent);
    });

    it('should not throw error when onMessage handler is not provided', () => {
      const managerWithoutHandlers = new SimpleWorkerManager('./test-worker.js');
      
      const mockEvent = new MessageEvent('message', { data: 'test data' });
      
      expect(() => {
        managerWithoutHandlers['onMessage'](mockEvent);
      }).not.toThrow();
    });
  });

  describe('onError', () => {
    it('should call the onError handler when an error occurs', () => {
      const mockErrorEvent = new ErrorEvent('error', { message: 'test error' });
      
      simpleWorkerManager['onError'](mockErrorEvent);
      
      expect(mockHandlers.onError).toHaveBeenCalledWith(mockErrorEvent);
    });

    it('should not throw error when onError handler is not provided', () => {
      const managerWithoutHandlers = new SimpleWorkerManager('./test-worker.js');
      
      const mockErrorEvent = new ErrorEvent('error', { message: 'test error' });
      
      expect(() => {
        managerWithoutHandlers['onError'](mockErrorEvent);
      }).not.toThrow();
    });
  });

  describe('onMessageError', () => {
    it('should call the onMessageError handler when a message error occurs', () => {
      const mockMessageErrorEvent = new MessageEvent('messageerror', { data: 'test error' });
      
      simpleWorkerManager['onMessageError'](mockMessageErrorEvent);
      
      expect(mockHandlers.onMessageError).toHaveBeenCalledWith(mockMessageErrorEvent);
    });

    it('should not throw error when onMessageError handler is not provided', () => {
      const managerWithoutHandlers = new SimpleWorkerManager('./test-worker.js');
      
      const mockMessageErrorEvent = new MessageEvent('messageerror', { data: 'test error' });
      
      expect(() => {
        managerWithoutHandlers['onMessageError'](mockMessageErrorEvent);
      }).not.toThrow();
    });
  });
});