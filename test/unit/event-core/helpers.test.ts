import { 
  on, 
  once, 
  off, 
  emit, 
  clear, 
  createEventScope, 
  EventBus,
  AppEvents 
} from "@/event-core/helpers";

describe("helpers", () => {
  // 保存原始 console.error 以便在测试后恢复
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console.error to suppress EventBus 错误日志
    console.error = jest.fn();
  });

  afterEach(() => {
    // 恢复原始 console.error
    console.error = originalConsoleError;
  });

  describe("on and emit", () => {
    it("应该能够订阅和发布事件", () => {
      const handler = jest.fn();
      const unsubscribe = on('login', handler);
      
      emit('login', { userId: '123' });
      
      expect(handler).toHaveBeenCalledWith({ userId: '123' });
      
      // 清理
      unsubscribe();
    });

    it("应该能够处理错误事件", () => {
      const testError = new Error('Test error');
      const handler = jest.fn();
      const unsubscribe = on('error', handler);
      
      emit('error', testError);
      
      expect(handler).toHaveBeenCalledWith(testError);
      
      // 清理
      unsubscribe();
    });
  });

  describe("once", () => {
    it("应该只执行一次事件处理器", () => {
      const handler = jest.fn();
      
      once('login', handler);
      
      emit('login', { userId: '123' });
      emit('login', { userId: '456' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ userId: '123' });
    });
  });

  describe("off", () => {
    it("应该能够取消事件订阅", () => {
      const handler = jest.fn();
      
      on('login', handler);
      off('login', handler);
      
      emit('login', { userId: '123' });
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("应该能够清除特定事件的所有订阅", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      on('login', handler1);
      on('error', handler2);
      
      clear('login'); // 只清除login事件
      
      emit('login', { userId: '123' }); // 这个不会触发handler1
      emit('error', new Error('test')); // 这个应该触发handler2
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it("应该能够清除所有事件订阅", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      on('login', handler1);
      on('error', handler2);
      
      clear(); // 清除所有事件
      
      emit('login', { userId: '123' });
      emit('error', new Error('test'));
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("createEventScope", () => {
    it("应该能够创建事件作用域", () => {
      const scope = createEventScope();
      
      expect(scope).toBeDefined();
      expect(typeof scope.on).toBe('function');
      expect(typeof scope.dispose).toBe('function');
    });

    it("创建的作用域应该能正常工作", () => {
      const scope = createEventScope();
      const handler = jest.fn();
      
      scope.on('login', handler);
      emit('login', { userId: '123' });
      
      expect(handler).toHaveBeenCalledWith({ userId: '123' });
      
      // 清理作用域
      scope.dispose();
    });
  });

  describe("EventBus export", () => {
    it("应该导出EventBus类", () => {
      expect(EventBus).toBeDefined();
      expect(typeof EventBus).toBe('function');
      
      // 验证EventBus可以正常实例化和使用
      const bus = new EventBus<AppEvents>();
      const handler = jest.fn();
      
      const unsubscribe = bus.on('login', handler);
      bus.emit('login', { userId: '123' });
      
      expect(handler).toHaveBeenCalledWith({ userId: '123' });
      
      unsubscribe();
    });
  });
});