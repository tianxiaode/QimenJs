import { EventBus } from '@/event-core/EventBus';
import { EventScope } from '@/event-core/EventScope';

// Mock logger to prevent LoggerChild errors in tests
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('EventBus', () => {
  // 保存原始 console.error 以便在测试后恢复
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console.error to suppress EventBus 错误日志
    console.error = jest.fn();
  });

  afterEach(() => {
    // 恢复原始 console.error
    console.error = originalConsoleError;
    // 清理 mock 调用记录
    mockLogger.error.mockClear();
  });

  describe('构造函数', () => {
    it('应该能够创建实例', () => {
      const bus = new EventBus(mockLogger);
      expect(bus).toBeInstanceOf(EventBus);
    });

    it('应该生成唯一的busId', () => {
      const bus1 = new EventBus(mockLogger);
      const bus2 = new EventBus(mockLogger);
      expect(bus1.getBusId()).not.toBe(bus2.getBusId());
    });
  });

  describe('事件订阅和触发 (on/emit)', () => {
    it('应该能够订阅事件', () => {
      const bus = new EventBus(mockLogger);
      const handler = jest.fn();

      const unsubscribe = bus.on('test', handler);
      bus.emit('test', 'payload');

      expect(handler).toHaveBeenCalledWith('payload');
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('应该能够处理多次触发', () => {
      const bus = new EventBus(mockLogger);
      const handler = jest.fn();

      bus.on('test', handler);
      bus.emit('test', 'payload1');
      bus.emit('test', 'payload2');

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, 'payload1');
      expect(handler).toHaveBeenNthCalledWith(2, 'payload2');
    });

    it('应该能够处理多个订阅者', () => {
      const bus = new EventBus(mockLogger);
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      bus.on('test', handler1);
      bus.on('test', handler2);
      bus.emit('test', 'payload');

      expect(handler1).toHaveBeenCalledWith('payload');
      expect(handler2).toHaveBeenCalledWith('payload');
    });

    it('应该捕获事件处理器中的错误', () => {
      const bus = new EventBus(mockLogger);
      const error = new Error('Handler error');
      const handler = () => { throw error; };

      bus.on('test', handler);
      bus.emit('test', 'payload');

      // 验证 logger.error 被调用
      expect(mockLogger.error).toHaveBeenCalled();
      // 根据EventBus中的实现，实际的日志格式是'[event] handler_error'
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[event] handler_error',
        expect.objectContaining({
          busId: expect.any(String),
          event: 'test',
          error: error
        })
      );
    });
  });

  describe('取消订阅 (off)', () => {
    it('应该能够取消事件订阅', () => {
      const bus = new EventBus(mockLogger);
      const handler = jest.fn();

      bus.on('test', handler);
      bus.off('test', handler);
      bus.emit('test', 'payload');

      expect(handler).not.toHaveBeenCalled();
    });

    it('取消未订阅的事件不应该报错', () => {
      const bus = new EventBus(mockLogger);
      const handler = jest.fn();

      expect(() => {
        bus.off('test', handler);
      }).not.toThrow();
    });
  });

  describe('一次性订阅 (once)', () => {
    it('应该只执行一次', () => {
      const bus = new EventBus(mockLogger);
      const handler = jest.fn();

      bus.once('test', handler);
      bus.emit('test', 'payload1');
      bus.emit('test', 'payload2');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('payload1');
    });
  });

  describe('事件清理 (clear)', () => {
    it('应该能够清理特定事件的所有订阅', () => {
      const bus = new EventBus(mockLogger);
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      bus.on('test1', handler1);
      bus.on('test2', handler2);
      bus.clear('test1');
      bus.emit('test1', 'payload');
      bus.emit('test2', 'payload');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('应该能够清理所有事件订阅', () => {
      const bus = new EventBus(mockLogger);
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      bus.on('test1', handler1);
      bus.on('test2', handler2);
      bus.clear();
      bus.emit('test1', 'payload');
      bus.emit('test2', 'payload');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('事件作用域 (createScope)', () => {
    it('应该能够创建事件作用域', () => {
      const bus = new EventBus(mockLogger);
      const scope = bus.createScope();

      expect(scope).toBeInstanceOf(EventScope);
    });

    it('作用域应该绑定到正确的事件总线', () => {
      const bus = new EventBus(mockLogger);
      const scope = bus.createScope();
      const handler = jest.fn();

      scope.on('test', handler);
      bus.emit('test', 'payload');

      expect(handler).toHaveBeenCalledWith('payload');
    });
  });
});