import { GlobalTaskQueue } from '@/tasks/task/TaskQueue';
import { TaskPriority } from '@/tasks/types';
import { after } from '@/utils/time/after';

// 模拟 after 函数
jest.mock('@/utils/time/after', () => ({
  after: jest.fn().mockReturnValue({
    cancel: jest.fn(),
  }),
}));

describe('TaskQueue', () => {
  let taskQueue: GlobalTaskQueue;

  beforeEach(() => {
    // 创建新的TaskQueue实例进行测试，而不是使用全局实例
    taskQueue = new GlobalTaskQueue();
    
    // 模拟Logger，避免在测试中出现Logger初始化问题
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    
    // 为TaskQueue实例的logger赋值
    Object.defineProperty(taskQueue, 'logger', {
      value: mockLogger,
      writable: true,
    });
  });

  afterEach(() => {
    // 清理模拟
    jest.clearAllMocks();
  });

  it('should add and execute a task', async () => {
    const taskFn = jest.fn().mockResolvedValue(undefined);
    
    // 添加任务
    taskQueue.addTask(taskFn, 'NORMAL');
    
    // 等待任务执行完成
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // 验证任务函数被调用
    expect(taskFn).toHaveBeenCalled();
  });

  it('should properly sort queue with getSortedQueue', () => {
    // 直接测试getSortedQueue方法，创建任务对象
    const taskQueueInstance = taskQueue as any;
    
    taskQueueInstance.taskQueue = [
      { id: '1', fn: jest.fn(), priority: 'LOW', retries: 0, maxRetries: 3, delay: 1000, isPolling: false, interval: 5000 },
      { id: '2', fn: jest.fn(), priority: 'HIGH', retries: 0, maxRetries: 3, delay: 1000, isPolling: false, interval: 5000 },
      { id: '3', fn: jest.fn(), priority: 'NORMAL', retries: 0, maxRetries: 3, delay: 1000, isPolling: false, interval: 5000 }
    ];

    const sorted = taskQueueInstance.getSortedQueue();
    
    // 高优先级任务应该在前面
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[1].priority).toBe('NORMAL');
    expect(sorted[2].priority).toBe('LOW');
  });

  it('should handle task failure and retry', async () => {
    const mockLogger = (taskQueue as any).logger;
    const taskFn = jest.fn()
      .mockRejectedValueOnce(new Error('First try failed'))
      .mockResolvedValue(undefined);

    // 模拟after函数，使其在延迟后执行
    const mockAfter = jest.requireMock('@/utils/time/after').after as jest.Mock;
    mockAfter.mockImplementation((delay: number, callback: () => void) => {
      setTimeout(callback, delay);
      return { cancel: jest.fn() };
    });

    taskQueue.addTask(taskFn, 'NORMAL', 3, 10); // 使用较小的延迟

    // 等待任务执行完成，包括重试
    await new Promise(resolve => setTimeout(resolve, 50));

    // 验证任务函数被调用了（包括重试）
    expect(taskFn).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle polling tasks correctly', async () => {
    const mockLogger = (taskQueue as any).logger;
    const taskFn = jest.fn().mockResolvedValue(undefined);

    // 模拟after函数，延迟执行以触发轮询
    const mockAfter = jest.requireMock('@/utils/time/after').after as jest.Mock;
    mockAfter.mockImplementation((delay: number, callback: () => void) => {
      setTimeout(callback, delay);
      return { cancel: jest.fn() };
    });

    // 添加一个轮询任务
    taskQueue.addTask(taskFn, 'NORMAL', 5, 1000, true, 10); // 使用较小的间隔

    // 等待任务执行
    await new Promise(resolve => setTimeout(resolve, 50));

    // 验证任务被多次执行（因为是轮询任务）
    expect(taskFn).toHaveBeenCalled();
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringMatching(/Task executed: task-/)
    );
  });

  it('should implement singleton pattern correctly', () => {
    const instance1 = GlobalTaskQueue.getInstance();
    const instance2 = GlobalTaskQueue.getInstance();
    
    expect(instance1).toBe(instance2);
    
    // 测试带参数的实例创建
    const instance3 = GlobalTaskQueue.getInstance(3);
    expect(instance3).toBe(instance1); // 应该还是同一个实例
  });

  it('should handle task failure when exceeding max retries', async () => {
    const mockLogger = (taskQueue as any).logger;
    const taskFn = jest.fn().mockRejectedValue(new Error('Task failed'));

    // 模拟after函数
    const mockAfter = jest.requireMock('@/utils/time/after').after as jest.Mock;
    mockAfter.mockImplementation((delay: number, callback: () => void) => {
      setTimeout(callback, delay);
      return { cancel: jest.fn() };
    });

    // 添加一个任务，只允许重试0次
    taskQueue.addTask(taskFn, 'NORMAL', 0, 10);

    // 等待任务执行完成
    await new Promise(resolve => setTimeout(resolve, 50));

    // 验证任务函数只被调用1次（初始执行，无重试）
    expect(taskFn).toHaveBeenCalledTimes(1);
    
    // 验证记录了超出最大重试次数的错误
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringMatching(/Task .* exceeded max retries/)
    );
  });

  it('should handle polling task failure when exceeding max retries', async () => {
    const mockLogger = (taskQueue as any).logger;
    const taskFn = jest.fn().mockRejectedValue(new Error('Polling task failed'));

    // 模拟after函数
    const mockAfter = jest.requireMock('@/utils/time/after').after as jest.Mock;
    mockAfter.mockImplementation((delay: number, callback: () => void) => {
      setTimeout(callback, delay);
      return { cancel: jest.fn() };
    });

    // 添加一个轮询任务，只允许重试0次
    taskQueue.addTask(taskFn, 'NORMAL', 0, 1000, true, 10);

    // 等待任务执行完成
    await new Promise(resolve => setTimeout(resolve, 50));

    // 验证任务函数被调用
    expect(taskFn).toHaveBeenCalled();
    
    // 验证记录了轮询任务超出最大重试次数的错误
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringMatching(/Polling task .* exceeded max retries/)
    );
  });

  it('should handle concurrent task queue execution correctly', async () => {
    const mockLogger = (taskQueue as any).logger;
    
    // 直接访问私有属性并设置为true来模拟队列正在运行
    (taskQueue as any).isRunning = true;
    
    // 手动调用run方法
    await (taskQueue as any).run();
    
    // 验证日志记录了队列正在运行的消息
    expect(mockLogger.debug).toHaveBeenCalledWith('Task queue is already running');
  });
});