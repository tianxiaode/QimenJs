import { composeMixins, DisposableBase, Constructor } from '@orbitjs/utils';

// 定义一些测试用的 Mixin
function TimestampMixin<T extends Constructor>(Base: T) {
  return class extends Base {
    timestamp: number;
    constructor(...args: any[]) {
      super(...args);
      this.timestamp = Date.now();
    }

    getTimestamp(): number {
      return this.timestamp;
    }
  };
}

function IdMixin<T extends Constructor>(Base: T) {
  return class extends Base {
    id: string;
    
    constructor(...args: any[]) {
      super(...args);
      // 使用一个简单的计数器来生成ID，而不是访问静态属性
      if (!(global as any).idCounter) {
        (global as any).idCounter = 0;
      }
      this.id = `test-id-${(global as any).idCounter++}`;
    }

    getId(): string {
      return this.id;
    }
  };
}

function LoggerMixin<T extends Constructor>(Base: T) {
  return class extends Base {
    log: string[] = [];

    logAction(action: string): void {
      this.log.push(`${action} at ${new Date().toISOString()}`);
    }

    getLog(): string[] {
      return this.log;
    }
  };
}

describe('composeMixins', () => {
  beforeEach(() => {
    // 重置全局计数器
    (global as any).idCounter = 0;
  });

  it('should return the base class when no mixins are provided', () => {
    class TestBase extends DisposableBase {}
    
    const MixedClass = composeMixins(TestBase, []);
    const instance = new MixedClass();
    
    expect(instance).toBeInstanceOf(TestBase);
    expect(instance).toBeInstanceOf(DisposableBase);
  });

  it('should apply a single mixin correctly', () => {
    class TestBase extends DisposableBase {}

    const MixedClass = composeMixins(TestBase, [TimestampMixin]);
    const instance = new MixedClass();

    expect(instance).toBeInstanceOf(TestBase);
    expect(instance).toBeInstanceOf(DisposableBase);
    expect('timestamp' in instance).toBe(true);
    expect(typeof (instance as any).getTimestamp).toBe('function');
    expect(typeof (instance as any).getTimestamp()).toBe('number');
  });

  it('should apply multiple mixins in the correct order', () => {
    class TestBase extends DisposableBase {}

    const MixedClass = composeMixins(TestBase, [TimestampMixin, IdMixin, LoggerMixin]);
    const instance = new MixedClass();

    // 检查所有 mixin 的属性和方法都存在
    expect(instance).toBeInstanceOf(TestBase);
    expect(instance).toBeInstanceOf(DisposableBase);
    expect('timestamp' in instance).toBe(true);
    expect('id' in instance).toBe(true);
    expect('log' in instance).toBe(true);
    expect(typeof (instance as any).getTimestamp).toBe('function');
    expect(typeof (instance as any).getId).toBe('function');
    expect(Array.isArray((instance as any).getLog())).toBe(true);
    
    // 检查功能是否正常
    (instance as any).logAction('test');
    expect((instance as any).getLog()).toContainEqual(expect.stringMatching(/test at/));
  });

  it('should apply mixins in the specified order', () => {
    // 创建一个可以验证应用顺序的 mixin
    let mixinCallOrder: string[] = [];
    
    function FirstMixin<T extends Constructor>(Base: T) {
      return class extends Base {
        constructor(...args: any[]) {
          super(...args);
          mixinCallOrder.push('FirstMixin');
        }
      };
    }
    
    function SecondMixin<T extends Constructor>(Base: T) {
      return class extends Base {
        constructor(...args: any[]) {
          super(...args);
          mixinCallOrder.push('SecondMixin');
        }
      };
    }

    class TestBase extends DisposableBase {}

    mixinCallOrder = []; // 重置
    const MixedClass = composeMixins(TestBase, [FirstMixin, SecondMixin]);
    new MixedClass();

    expect(mixinCallOrder).toEqual(['FirstMixin', 'SecondMixin']);
  });

  it('should allow methods from different mixins to interact', () => {
    // 创建一个依赖于其他 mixin 的 mixin
    let logContent: string[] = [];
    
    function EnhancedLoggerMixin<T extends Constructor>(Base: T) {
      return class extends Base {
        enhancedLogAction(action: string): void {
          // 假设这个 mixin 依赖于 IdMixin
          if ('getId' in this) {
            const id = (this as any).getId();
            logContent.push(`${id} performed action: ${action}`);
          } else {
            logContent.push(`performed action: ${action}`);
          }
        }
      };
    }

    class TestBase extends DisposableBase {}

    const MixedClass = composeMixins(TestBase, [IdMixin, LoggerMixin, EnhancedLoggerMixin]);
    const instance = new MixedClass();

    (instance as any).enhancedLogAction('test action');
    
    expect(logContent).toContainEqual(expect.stringMatching(/test-id-\d+ performed action: test action/));
  });

  it('should preserve the base class functionality', () => {
    // 创建一个有特定功能的基类
    class FunctionalBase extends DisposableBase {
      value: number;
      
      constructor(value: number = 0) {
        super();
        this.value = value;
      }
      
      getValue(): number {
        return this.value;
      }
      
      setValue(value: number): void {
        this.value = value;
      }
    }

    const MixedClass = composeMixins(FunctionalBase, [TimestampMixin]);
    const instance = new MixedClass(42);

    expect((instance as any).getValue()).toBe(42);
    (instance as any).setValue(100);
    expect((instance as any).getValue()).toBe(100);
    expect('timestamp' in instance).toBe(true);
  });
});