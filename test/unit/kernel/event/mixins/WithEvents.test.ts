import { Constructor, DisposableBase } from '@orbitjs/utils';
import { WithDomEvents } from '../../../../src/event/mixins/WithDomEvents';
import { globalEventBus } from '../../../../src/event/core/GlobalEventBus';
import { EventBus } from '../../../../src/event/core/EventBus';
import { Logger } from '@orbitjs/logger';

// Mock Logger.for 方法
jest.mock('@orbitjs/logger', () => {
  const actualLogger = jest.requireActual('@orbitjs/logger');
  return {
    ...actualLogger,
    Logger: {
      ...actualLogger.Logger,
      for: jest.fn(() => ({
        emit: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      })),
    },
  };
});

// 创建一个测试类，继承自DisposableBase
class TestClass extends DisposableBase {
  public value: number;
  
  constructor(value: number = 0) {
    super();
    this.value = value;
  }
  
  increment() {
    this.value++;
  }
}

// 应用WithEvents混入
const TestClassWithEvents = WithDomEvents(TestClass as Constructor<TestClass>);

// 定义一个类型，表示TestClass和WithEvents的合并类型
type TestClassWithEventsType = InstanceType<typeof TestClassWithEvents> & { value: number; increment: () => void; };

describe('WithEvents Mixin', () => {
  let instance: TestClassWithEventsType;

  beforeEach(() => {
    // 由于混入函数返回抽象类，我们需要创建一个具体实现
    const ConcreteClass = class extends TestClassWithEvents {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    instance = new ConcreteClass(10) as unknown as TestClassWithEventsType;
  });

  afterEach(() => {
    // 确保清理实例
    instance.dispose();
  });

  test('should add event methods to the base class', () => {
    expect(instance.on).toBeDefined();
    expect(instance.once).toBeDefined();
    expect(instance.emit).toBeDefined();
    expect(instance.bind).toBeDefined();
  });

  test('should allow subscribing to events with on', () => {
    const handler = jest.fn();
    const off = instance.on('test-event', handler);
    
    instance.emit('test-event', { data: 'test' });
    
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ data: 'test' });
    
    // 验证取消订阅功能
    off();
    instance.emit('test-event', { data: 'test2' });
    expect(handler).toHaveBeenCalledTimes(1); // 次数不应该增加
  });

  test('should allow one-time event subscription with once', () => {
    const handler = jest.fn();
    instance.once('once-event', handler);
    
    instance.emit('once-event', { data: 'first' });
    instance.emit('once-event', { data: 'second' });
    
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ data: 'first' });
  });

  test('should support emitting events without payload', () => {
    const handler = jest.fn();
    instance.on('no-payload-event', handler);
    
    instance.emit('no-payload-event');
    
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(undefined);
  });

  test('should maintain base class functionality', () => {
    expect(instance.value).toBe(10);
    instance.increment();
    expect(instance.value).toBe(11);
  });

  test('should properly dispose event scope', () => {
    const handler = jest.fn();
    
    // 在第一次调用时创建_eventScope
    instance.on('test-dispose', handler);
    
    // 现在_eventScope已经被创建，可以进行spy
    const eventScope = (instance as any)._eventScope;
    const disposeSpy = jest.spyOn(eventScope, 'dispose');
    
    // 验证事件可以正常工作
    instance.emit('test-dispose');
    expect(handler).toHaveBeenCalledTimes(1);
    
    // 调用dispose
    instance.dispose();
    
    // 验证事件作用域的dispose被调用
    expect(disposeSpy).toHaveBeenCalled();
    
    // 验证事件不再触发
    instance.emit('test-dispose');
    expect(handler).toHaveBeenCalledTimes(1); // 次数不应增加
  });

  test('should handle dispose when _eventScope is undefined', () => {
    // 创建一个新实例，不触发_eventScope的创建
    const ConcreteClass = class extends TestClassWithEvents {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    const newInstance = new ConcreteClass() as unknown as TestClassWithEventsType;
    
    // 直接调用dispose不应该抛出错误
    expect(() => newInstance.dispose()).not.toThrow();
  });

  test('should not emit events after disposal', () => {
    const handler = jest.fn();
    // 触发_eventScope创建
    instance.on('after-dispose', handler);
    const scope = (instance as any)._eventScope;
    
    instance.dispose();
    
    // 发送事件后，处理函数不应该被调用
    instance.emit('after-dispose', { data: 'test' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('should call parent dispose if exists', () => {
    // 创建一个带有dispose方法的测试类
    class TestClassWithDispose extends DisposableBase {
      disposed = false;
      
      dispose() {
        super.dispose();
        this.disposed = true;
      }
    }
    
    const TestClassWithEventsAndDispose = WithDomEvents(TestClassWithDispose as Constructor<TestClassWithDispose>);
    
    const ConcreteDisposeClass = class extends TestClassWithEventsAndDispose {
      constructor() {
        super();
      }
    };
    
    const instanceWithDispose = new ConcreteDisposeClass() as unknown as InstanceType<typeof TestClassWithEventsAndDispose>;
    
    instanceWithDispose.dispose();
    
    expect(instanceWithDispose.disposed).toBe(true);
  });
  
  test('should bind gesture semantic to target element', () => {
    const mockTarget = document.createElement('div');
    const mockHandler = jest.fn();
    
    // 监听适配器的bind方法
    const bindSpy = jest.spyOn((instance as any).adapter, 'bind');
    
    // 绑定一个点击手势到元素
    instance.bind(mockTarget, 'click', { preventDefault: true });
    
    // 验证适配器的bind方法被正确调用
    expect(bindSpy).toHaveBeenCalledWith(mockTarget, 'click', expect.any(Object), { preventDefault: true });
  });
  
  test('should access eventScope getter to ensure it is created', () => {
    // 访问 eventScope 属性以确保其 getter 被调用
    const scope = (instance as any).eventScope;
    expect(scope).toBeDefined();
    
    // 确保 _eventScope 已被初始化
    expect((instance as any)._eventScope).toBeDefined();
  });
  
  test('should call super.dispose when it exists', () => {
    // 创建一个有明确dispose方法的父类
    class ParentWithDispose extends TestClass {
      disposeCalled = false;
      
      dispose() {
        this.disposeCalled = true;
        super.dispose();
      }
    }
    
    const ExtendedWithEvents = WithDomEvents(ParentWithDispose as Constructor<ParentWithDispose>);
    
    const ConcreteExtendedClass = class extends ExtendedWithEvents {
      constructor() {
        super();
      }
    };
    
    const testInstance = new ConcreteExtendedClass() as unknown as ParentWithDispose;
    
    // 确保在调用dispose之前super.dispose没有被调用
    expect(testInstance.disposeCalled).toBe(false);
    
    testInstance.dispose();
    
    // 现在应该调用了super.dispose
    expect(testInstance.disposeCalled).toBe(true);
  });
});