import { EventBus } from "@/event/core/EventBus";
import { EventScope } from "@/event/core/EventScope";

// Mock logger to prevent LoggerChild errors in tests
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// 定义测试用的事件类型
type TestEvents = {
  'test:event': { message: string };
  'test:other': number;
  'test:empty': void;
};

describe("EventScope", () => {
  let bus: EventBus<TestEvents>;
  let scope: EventScope<TestEvents>;
  // 保存原始 console.error 以便在测试后恢复
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console.error to suppress EventBus 错误日志
    console.error = jest.fn();
    bus = new EventBus<TestEvents>(mockLogger);
    scope = new EventScope(bus, mockLogger);
  });

  afterEach(() => {
    // 恢复原始 console.error
    console.error = originalConsoleError;
    scope.dispose();
  });

  describe("constructor", () => {
    it("应该能够正确创建EventScope实例", () => {
      expect(scope).toBeInstanceOf(EventScope);
      expect((scope as any).bus).toBe(bus);
    });
  });

  describe("on", () => {
    it("应该能够订阅事件并将其绑定到作用域", () => {
      const handler = jest.fn();
      scope.on('test:event', handler);
      
      bus.emit('test:event', { message: 'hello' });
      
      expect(handler).toHaveBeenCalledWith({ message: 'hello' });
    });

    it("返回的取消订阅函数应该能够取消事件订阅", () => {
      const handler = jest.fn();
      const unsubscribe = scope.on('test:event', handler);
      
      unsubscribe();
      bus.emit('test:event', { message: 'hello' });
      
      expect(handler).not.toHaveBeenCalled();
    });

    it("在作用域已销毁后调用on应该返回空函数", () => {
      scope.dispose();
      const result = scope.on('test:event', () => {});
      
      expect(typeof result).toBe('function');
    });
  });

  describe("once", () => {
    it("应该只执行一次事件处理器并将其绑定到作用域", () => {
      const handler = jest.fn();
      scope.once('test:event', handler);
      
      bus.emit('test:event', { message: 'first' });
      bus.emit('test:event', { message: 'second' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ message: 'first' });
    });
  });

  describe("dispose", () => {
    it("应该取消所有绑定到作用域的事件订阅", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      scope.on('test:event', handler1);
      scope.on('test:other', handler2);
      
      scope.dispose();
      
      bus.emit('test:event', { message: 'hello' });
      bus.emit('test:other', 42);
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it("多次调用dispose应该不会出错", () => {
      expect(() => {
        scope.dispose();
        scope.dispose();
      }).not.toThrow();
    });

    it("应该标记作用域为已销毁", () => {
      scope.dispose();
      
      // 验证内部状态，通过尝试添加新监听器的行为
      const handler = jest.fn();
      const unsubscribe = scope.on('test:event', handler);
      
      bus.emit('test:event', { message: 'hello' });
      // 在已销毁的作用域上调用 on 应该不会有任何效果
    });
  });

  describe("getScopeId", () => {
    it("应该返回唯一的事件作用域ID", () => {
      const id1 = scope.getScopeId();
      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      
      const anotherScope = new EventScope(bus);
      const id2 = anotherScope.getScopeId();
      
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      
      anotherScope.dispose();
    });
  });
});