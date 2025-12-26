import { EventBus } from "@/event-core/EventBus";
import { EventScope } from "@/event-core/EventScope";

// 定义测试用的事件类型
type TestEvents = {
  'test:event': { message: string };
  'test:other': number;
  'test:empty': void;
};

describe("EventBus", () => {
  let bus: EventBus<TestEvents>;

  beforeEach(() => {
    bus = new EventBus<TestEvents>();
  });

  describe("on", () => {
    it("应该能够订阅事件并返回取消订阅函数", () => {
      const handler = jest.fn();
      const unsubscribe = bus.on('test:event', handler);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it("应该能够接收到发布的事件", () => {
      const handler = jest.fn();
      bus.on('test:event', handler);
      
      bus.emit('test:event', { message: 'hello' });
      
      expect(handler).toHaveBeenCalledWith({ message: 'hello' });
    });

    it("应该能够处理多种类型的事件", () => {
      const eventHandler = jest.fn();
      const otherHandler = jest.fn();
      
      bus.on('test:event', eventHandler);
      bus.on('test:other', otherHandler);
      
      bus.emit('test:event', { message: 'hello' });
      bus.emit('test:other', 42);
      
      expect(eventHandler).toHaveBeenCalledWith({ message: 'hello' });
      expect(otherHandler).toHaveBeenCalledWith(42);
    });
  });

  describe("once", () => {
    it("应该只执行一次事件处理器", () => {
      const handler = jest.fn();
      bus.once('test:event', handler);
      
      bus.emit('test:event', { message: 'first' });
      bus.emit('test:event', { message: 'second' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ message: 'first' });
    });
  });

  describe("off", () => {
    it("应该能够取消特定事件处理器", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      bus.on('test:event', handler1);
      bus.on('test:event', handler2);
      
      bus.off('test:event', handler1);
      
      bus.emit('test:event', { message: 'hello' });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith({ message: 'hello' });
    });
  });

  describe("emit", () => {
    it("应该能够发布事件并传递载荷", () => {
      const handler = jest.fn();
      bus.on('test:event', handler);
      
      const payload = { message: 'test payload' };
      bus.emit('test:event', payload);
      
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it("应该处理空载荷事件(void)", () => {
      const handler = jest.fn();
      bus.on('test:empty', handler);
      
      // 对于void类型，传递undefined
      bus.emit('test:empty', undefined);
      
      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it("应该捕获事件处理器中的错误", () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Handler error');
      const handler = () => { throw error; };
      
      bus.on('test:event', handler);
      bus.emit('test:event', { message: 'test' });
      
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe("clear", () => {
    it("应该能够清除特定事件的所有订阅", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      bus.on('test:event', handler1);
      bus.on('test:other', handler2);
      
      bus.clear('test:event'); // 只清除test:event事件
      
      bus.emit('test:event', { message: 'hello' }); // 这个不会触发handler1
      bus.emit('test:other', 42); // 这个应该触发handler2
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it("应该能够清除所有事件订阅", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      bus.on('test:event', handler1);
      bus.on('test:other', handler2);
      
      bus.clear(); // 清除所有事件
      
      bus.emit('test:event', { message: 'hello' });
      bus.emit('test:other', 42);
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("createScope", () => {
    it("应该能够创建EventScope实例", () => {
      const scope = bus.createScope();
      
      expect(scope).toBeInstanceOf(EventScope);
      expect(scope).toBeDefined();
    });

    it("创建的作用域应该与事件总线关联", () => {
      const scope = bus.createScope();
      
      // 发布一个事件，通过作用域订阅的处理器应该能接收到
      const handler = jest.fn();
      scope.on('test:event', handler);
      
      bus.emit('test:event', { message: 'hello' });
      
      expect(handler).toHaveBeenCalledWith({ message: 'hello' });
    });
  });

  describe("getBusId", () => {
    it("应该返回唯一的事件总线ID", () => {
      const id1 = bus.getBusId();
      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      
      const anotherBus = new EventBus<TestEvents>();
      const id2 = anotherBus.getBusId();
      
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });
});