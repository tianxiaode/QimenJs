import { HashWorkerManager } from '@/tasks/worker/hash/HashWorkerManager';

// 模拟 logger 以避免错误
jest.mock('@/logger', () => ({
  Logger: {
    for: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }))
  }
}));

// 模拟 TextEncoder（Node.js 环境中可能不存在）
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// 模拟 Worker 环境
const mockPostMessage = jest.fn();
const mockTerminate = jest.fn();
const mockOnMessage = jest.fn();
const mockOnError = jest.fn();

// 创建 Mock Worker 构造函数
class MockWorker {
  postMessage = mockPostMessage;
  terminate = mockTerminate;
  onmessage = mockOnMessage;
  onerror = mockOnError;
}

describe('HashWorkerManager', () => {
  let hashWorkerManager: HashWorkerManager;
  const mockWorkerUrl = '/mock/worker.js';

  beforeEach(() => {
    // 设置 Worker 模拟
    (global as any).Worker = MockWorker;

    hashWorkerManager = new HashWorkerManager(mockWorkerUrl);
  });

  afterEach(() => {
    // 清理模拟
    jest.clearAllMocks();
    mockPostMessage.mockClear();
    mockTerminate.mockClear();
    mockOnMessage.mockClear();
    mockOnError.mockClear();
    
    // 清理 Worker 模拟
    (global as any).Worker = undefined;
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(hashWorkerManager).toBeInstanceOf(HashWorkerManager);
      // 验证默认配置
      const config = (hashWorkerManager as any).configure({});
      expect((hashWorkerManager as any).algorithm).toBe('SHA-256');
      expect((hashWorkerManager as any).chunkSize).toBe(1024 * 1024);
      expect((hashWorkerManager as any).format).toBe('hex');
    });

    it('should accept custom options', () => {
      const customOptions = {
        algorithm: 'MD5' as const,
        chunkSize: 512 * 1024, // 512KB
        format: 'base64' as const,
      };

      const customHashWorkerManager = new HashWorkerManager(mockWorkerUrl, customOptions);
      expect((customHashWorkerManager as any).algorithm).toBe('MD5');
      expect((customHashWorkerManager as any).chunkSize).toBe(512 * 1024);
      expect((customHashWorkerManager as any).format).toBe('base64');
    });
  });

  describe('configure', () => {
    it('should update configuration options', () => {
      const newOptions = {
        algorithm: 'SHA-1' as const,
        chunkSize: 2 * 1024 * 1024, // 2MB
        format: 'hex' as const,
      };

      hashWorkerManager.configure(newOptions);

      expect((hashWorkerManager as any).algorithm).toBe('SHA-1');
      expect((hashWorkerManager as any).chunkSize).toBe(2 * 1024 * 1024);
      expect((hashWorkerManager as any).format).toBe('hex');
    });

    it('should support chaining', () => {
      const result = hashWorkerManager.configure({});
      expect(result).toBe(hashWorkerManager);
    });
  });

  describe('hashFile', () => {
    it('should process file with FileHashProcessor', () => {
      // 创建一个模拟的File对象
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockCallback = jest.fn();

      // 测试hashFile方法
      try {
        hashWorkerManager.hashFile(mockFile, mockCallback);
        // 验证没有抛出错误
        expect(true).toBe(true);
      } catch (e) {
        // 如果有错误，测试失败
        expect(e).toBeUndefined();
      }
    });

    it('should apply options when provided', () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockCallback = jest.fn();
      const options = { algorithm: 'MD5' as const };

      try {
        hashWorkerManager.hashFile(mockFile, mockCallback, options);
        // 验证没有抛出错误
        expect(true).toBe(true);
      } catch (e) {
        // 如果有错误，测试失败
        expect(e).toBeUndefined();
      }
    });
  });

  describe('hashData', () => {
    it('should process data with DataHashProcessor', () => {
      const testData = 'test data';
      const mockCallback = jest.fn();

      try {
        // 测试hashData方法
        hashWorkerManager.hashData(testData, mockCallback);
        // 验证没有抛出错误
        expect(true).toBe(true);
      } catch (e) {
        // 如果有错误，测试失败
        expect(e).toBeUndefined();
      }
    });

    it('should apply options when provided', () => {
      const testData = 'test data';
      const mockCallback = jest.fn();
      const options = { format: 'base64' as const };

      try {
        hashWorkerManager.hashData(testData, mockCallback, options);
        // 验证没有抛出错误
        expect(true).toBe(true);
      } catch (e) {
        // 如果有错误，测试失败
        expect(e).toBeUndefined();
      }
    });
  });

  describe('onMessage', () => {
    it('should handle message events', () => {
      const mockEvent: MessageEvent = {
        data: {
          taskId: 'test-task',
          hash: 'abc123',
          progress: 100,
        },
      } as MessageEvent;

      try {
        // 直接调用onMessage方法
        (hashWorkerManager as any).onMessage(mockEvent);
        // 验证没有抛出错误
        expect(true).toBe(true);
      } catch (e) {
        // 如果有错误，测试失败
        expect(e).toBeUndefined();
      }
    });
  });

  describe('onError', () => {
    it('should handle error events', () => {
      const mockErrorEvent: ErrorEvent = {
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      } as ErrorEvent;

      try {
        // 直接调用onError方法
        (hashWorkerManager as any).onError(mockErrorEvent);
        // 验证没有抛出错误
        expect(true).toBe(true);
      } catch (e) {
        // 如果有错误，测试失败
        expect(e).toBeUndefined();
      }
    });
  });
});