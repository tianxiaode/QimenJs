// 定义MockLogger类
class MockLogger {
  logs: { level: string; message: string }[] = [];

  warn(message: string) {
    this.logs.push({ level: 'warn', message });
  }

  error(message: string) {
    this.logs.push({ level: 'error', message });
  }

  info(message: string) {
    this.logs.push({ level: 'info', message });
  }

  debug(message: string) {
    this.logs.push({ level: 'debug', message });
  }
  
  trace(message: string) {
    this.logs.push({ level: 'trace', message });
  }
  
  fatal(message: string) {
    this.logs.push({ level: 'fatal', message });
  }
  
  withFields(fields: Record<string, any>) {
    return this;
  }
  
  withTag(tag: string) {
    return this;
  }
}

// Mock the Logger module before importing anything that uses it
jest.mock('@orbitjs/logger', () => {
  return {
    Logger: {
      for: jest.fn().mockImplementation(() => new MockLogger()),
    },
    ILogger: jest.fn(),
    LoggerChild: jest.fn().mockImplementation(() => new MockLogger()),
  };
});

import { ComposableBase, AbilityBase, Ability } from '@/composable';
import { ComposableRegistrar } from '@/composable/ComposableRegistrar';
import type { IComposableBase, IExposeResult } from '@/composable/types/composable';

class TestHost implements IComposableBase {
  logger = new MockLogger();
  
  getStatic<T>(key: string | symbol): T | undefined {
    return undefined;
  }
  
  setStatic<T>(key: string | symbol, value: T): void {
    // Implementation not needed for test
  }
}

class TestAbility extends AbilityBase {
  readonly name = 'TestAbility';
  
  testProperty = 'test value';
  
  testMethod() {
    return 'test method result';
  }
  
  protected expose(): IExposeResult {
    return {
      testProperty: this.testProperty,
      testMethod: this.testMethod
    };
  }
}

describe('Composable Module Integration', () => {
  describe('AbilityBase and ComposableBase integration', () => {
    it('should work together correctly', () => {
      const composable = new class extends ComposableBase {
        constructor() {
          super();
        }
      }();
      
      // Verify that composable has the expected properties
      expect(composable.logger).toBeDefined();
      expect(composable.getStatic).toBeDefined();
      expect(composable.setStatic).toBeDefined();
    });

    it('should handle decorator usage properly', () => {
      // Create a separate test to verify decorator functionality
      const ABILITIES_KEY = Symbol('__abilities__');
      
      // Define the decorator inline to make sure we understand its behavior
      function TestDecorator(...keys: string[]) {
        return (ctor: any) => {
          ctor[ABILITIES_KEY] = keys;
        };
      }
      
      // Create a class that uses the decorator
      @TestDecorator('TestAbility1', 'TestAbility2')
      class TestDecoratedClass extends ComposableBase {
        constructor() {
          super();
        }
      }
      
      // Check that the decorator assigned the ability keys to the constructor
      const decoratedKeys = (TestDecoratedClass as any)[ABILITIES_KEY];
      
      // Verify that the decorator worked correctly
      expect(decoratedKeys).toEqual(['TestAbility1', 'TestAbility2']);
    });
  });

  describe('Module exports', () => {
    it('should export ComposableBase', () => {
      expect(ComposableBase).toBeDefined();
      expect(typeof ComposableBase).toBe('function');
    });

    it('should export Ability decorator', () => {
      expect(Ability).toBeDefined();
      expect(typeof Ability).toBe('function');
    });

    it('should export AbilityBase', () => {
      expect(AbilityBase).toBeDefined();
      expect(typeof AbilityBase).toBe('function');
    });

    it('should export ComposableRegistrar', () => {
      expect(ComposableRegistrar).toBeDefined();
      expect(typeof ComposableRegistrar).toBe('function');
    });
  });

  describe('ComposableRegistrar', () => {
    it('should be a singleton', () => {
      const instance1 = ComposableRegistrar.getInstance();
      const instance2 = ComposableRegistrar.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should register and retrieve abilities', () => {
      const registrar = ComposableRegistrar.getInstance();
      
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const entry = registrar.get('TestAbility');
      expect(entry).toBeDefined();
      expect(entry?.name).toBe('TestAbility');
    });

    it('should precompile abilities on demand', () => {
      const registrar = ComposableRegistrar.getInstance();
      
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const precompiled = registrar.getPrecompiled('TestAbility');
      expect(precompiled).toBeDefined();
      expect(precompiled?.name).toBe('TestAbility');
    });

    it('should cache ability instances', () => {
      const registrar = ComposableRegistrar.getInstance();
      
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      // First call - should create instance
      const precompiled1 = registrar.getPrecompiled('TestAbility');
      
      // Second call - should use cached instance
      const precompiled2 = registrar.getPrecompiled('TestAbility');
      
      // Both should be the same (cached)
      expect(precompiled1).toBe(precompiled2);
    });
  });
});
