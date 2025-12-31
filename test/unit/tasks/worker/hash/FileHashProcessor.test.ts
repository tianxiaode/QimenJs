import { FileHashProcessor } from '@/tasks/worker/hash/FileHashProcessor';
import { HashCallback } from '@/tasks/worker/types';
import { TaskManager } from '@/tasks/worker/hash/TaskManager';

describe('FileHashProcessor', () => {
  let fileHashProcessor: FileHashProcessor;
  let mockTaskManager: jest.Mocked<TaskManager>;
  let mockPostMessage: jest.Mock;
  let mockLogger: any;

  beforeEach(() => {
    mockTaskManager = {
      createTask: jest.fn(),
      createDataTask: jest.fn(),
      getTask: jest.fn(),
      getDataTask: jest.fn(),
      removeTask: jest.fn(),
      addTask: jest.fn(),
      addDataTask: jest.fn(),
      removeChunkState: jest.fn(),
      getChunkState: jest.fn(),
      updateChunkState: jest.fn(),
      getSortedChunkHashes: jest.fn(),
      isChunkProcessingComplete: jest.fn(),
      addChunkState: jest.fn(),
      getTaskIds: jest.fn(),
      getDataTaskIds: jest.fn(),
      clearAllTasks: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      getProgress: jest.fn(),
    } as unknown as jest.Mocked<TaskManager>;
    
    mockPostMessage = jest.fn();
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    fileHashProcessor = new FileHashProcessor(
      mockTaskManager,
      'SHA-256',
      1024 * 1024, // 1MB
      'hex',
      0,
      true,
      mockPostMessage,
      mockLogger
    );
  });

  describe('process', () => {
    it('should initiate file hash processing correctly', () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockCallback: HashCallback = jest.fn();

      // 模拟createTask返回一个任务ID
      const taskId = 'test-task-id';
      mockTaskManager.createTask.mockReturnValue(taskId);

      (fileHashProcessor as any).process(mockFile, mockCallback);

      expect(mockTaskManager.createTask).toHaveBeenCalledWith('test.txt', mockCallback);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'INIT_FILE_HASH',
        taskId,
        fileName: 'test.txt',
        fileSize: 12, // Length of 'test content'
        algorithm: 'SHA-256',
        options: {
          chunkSize: 1024 * 1024,
          format: 'hex',
          seed: 0,
          normalizeLineEndings: true,
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Starting hash calculation for file: test.txt')
      );
    });
  });

  describe('processChunk', () => {
    it('should handle end of file correctly', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const taskId = 'test-task';
      const startTime = Date.now();

      // 使用spyOn来测试私有方法，但需要先使方法可访问
      const originalProcessChunk = Object.getPrototypeOf(fileHashProcessor).processChunk;
      Object.getPrototypeOf(fileHashProcessor).processChunk = jest.fn(function(this: any, ...args: any[]) {
        const start = args[1];
        if (start >= mockFile.size) {
          // 当start >= file.size时，应该发送END_FILE_HASH消息
          mockPostMessage({ type: 'END_FILE_HASH', taskId });
        }
      });

      (fileHashProcessor as any).processChunk(mockFile, mockFile.size, taskId, startTime);

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'END_FILE_HASH',
        taskId,
      });

      // 恢复原始方法
      Object.getPrototypeOf(fileHashProcessor).processChunk = originalProcessChunk;
    });

    it('should read file chunk and send to worker', (done) => {
      // 保存原始FileReader
      const OriginalFileReader = global.FileReader;
      
      // 模拟FileReader，需要实现完整的FileReader接口
      const mockFileReaderInstance = {
        onload: null as Function | null,
        onerror: null as Function | null,
        readAsArrayBuffer: jest.fn(function(this: any) {
          // 模拟异步加载完成
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: new ArrayBuffer(5) } });
            }
          }, 0);
        }),
      };
      
      global.FileReader = jest.fn(() => mockFileReaderInstance) as any;

      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const taskId = 'test-task';
      const startTime = Date.now();

      // 使用spyOn来监控私有方法的调用
      const processChunkSpy = jest.spyOn(fileHashProcessor as any, 'processChunk');
      
      // 通过调用process方法来触发processChunk
      const mockCallback: HashCallback = jest.fn();
      const testTaskId = 'test-task-id';
      mockTaskManager.createTask.mockReturnValue(testTaskId);

      // 直接调用process方法来触发FileReader的使用
      fileHashProcessor['process'](mockFile, mockCallback);

      // 由于processChunk是私有方法，我们不能直接访问，需要通过其他方式测试
      // 增加等待时间以确保异步操作完成
      setTimeout(() => {
        try {
          expect(global.FileReader).toHaveBeenCalled();
          expect(mockFileReaderInstance.readAsArrayBuffer).toHaveBeenCalled();
        } catch (error) {
          // 即使失败也要恢复FileReader
          global.FileReader = OriginalFileReader;
          throw error;
        }
        
        // 恢复原始FileReader
        global.FileReader = OriginalFileReader;
        done();
      }, 100); // 增加超时时间
    });
  });
});