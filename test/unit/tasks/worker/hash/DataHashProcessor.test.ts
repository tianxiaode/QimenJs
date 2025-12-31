// 模拟TextEncoder
global.TextEncoder = require('util').TextEncoder;

import { DataHashProcessor } from '@/tasks/worker/hash/DataHashProcessor';
import { TaskManager } from '@/tasks/worker/hash/TaskManager';
import { Logger } from '@/logger';

describe('DataHashProcessor', () => {
  let dataHashProcessor: DataHashProcessor;
  let mockTaskManager: jest.Mocked<TaskManager>;
  let mockPostMessage: jest.Mock;
  let mockLogger: any;

  beforeEach(() => {
    mockTaskManager = {
      // 模拟TaskManager的方法
    } as jest.Mocked<TaskManager>;
    
    mockPostMessage = jest.fn();
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    dataHashProcessor = new DataHashProcessor(
      mockTaskManager,
      'SHA-256',
      'hex',
      0,
      true,
      mockPostMessage,
      mockLogger
    );
  });

  describe('hashData', () => {
    it('should process string data correctly', () => {
      const testData = 'Hello, World!';
      const taskId = 'test-task';
      const startTime = Date.now();

      (dataHashProcessor as any).hashData(testData, taskId, startTime);

      // 检查调用次数和类型
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const callArgs = (mockPostMessage as jest.Mock).mock.calls[0][0];
      
      // 验证调用参数
      expect(callArgs).toMatchObject({
        type: 'HASH_FULL',
        algorithm: 'SHA-256',
        options: {
          format: 'hex',
          seed: 0,
          normalizeLineEndings: true,
        },
      });

      // 使用更通用的方式检查ArrayBuffer
      expect(callArgs.data).toBeDefined();
      expect(callArgs.data).toHaveProperty('byteLength');
      expect(callArgs.data.byteLength).toBeGreaterThan(0);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Starting hash calculation for data type: string')
      );
    });

    it('should process ArrayBuffer data correctly', () => {
      const testBuffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello" in bytes
      const taskId = 'test-task';
      const startTime = Date.now();

      (dataHashProcessor as any).hashData(testBuffer, taskId, startTime);

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'HASH_FULL',
        data: testBuffer,
        algorithm: 'SHA-256',
        options: {
          format: 'hex',
          seed: 0,
          normalizeLineEndings: true,
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Starting hash calculation for data type: object')
      );
    });

    it('should log debug information when processing string data', () => {
      const testData = 'Test string';
      const taskId = 'test-task';
      const startTime = Date.now();

      (dataHashProcessor as any).hashData(testData, taskId, startTime);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Encoded string to ArrayBuffer')
      );
    });

    it('should log debug information when processing non-string data', () => {
      const testData = new ArrayBuffer(10);
      const taskId = 'test-task';
      const startTime = Date.now();

      (dataHashProcessor as any).hashData(testData, taskId, startTime);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Processing data object of type: ArrayBuffer')
      );
    });
  });
});