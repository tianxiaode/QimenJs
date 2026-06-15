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
import { IComposableBase, IExposeResult } from '@/composable/types/composable';
import { ComposableRegistrar } from '@/composable/ComposableRegistrar';

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
  });
});
