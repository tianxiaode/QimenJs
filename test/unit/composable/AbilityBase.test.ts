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

import { AbilityBase } from '@/composable/AbilityBase';
import type { IComposableBase, IExposeResult, IPrecompiledAbility } from '@/composable/types/composable';

class TestHost implements IComposableBase {
  logger = new MockLogger();
  testProperty = 'original value';
  
  get host(): this {
    return this;
  }
  
  testMethod() {
    return 'original method';
  }
  
  getStatic<T>(key: string | symbol): T | undefined {
    return undefined;
  }
  
  setStatic<T>(key: string | symbol, value: T): void {
    // Implementation not needed for test
  }
}

// Define a simple ability that exposes some properties
class TestAbility extends AbilityBase {
  // Implement the abstract expose method
  protected expose(): IExposeResult {
    return {
      injectedProp: 'injected value',
      injectedMethod: () => 'injected method',
      testProperty: 'conflicting value',
      testMethod: () => 'conflicting method'
    };
  }
  
  // Override onDispose to track when it's called
  protected onDispose(): void {
    super.onDispose();
  }
}

// Special test ability for symbol properties
class TestAbilityWithSymbol extends AbilityBase {
  protected expose(): IExposeResult {
    return {
      injectedProp: 'injected value',
      injectedMethod: () => 'injected method',
      [Symbol('test')]: 'symbol value'
    };
  }
  
  protected onDispose(): void {
    super.onDispose();
  }
}

// Test ability that creates a getter/setter property
class TestAbilityWithGetterSetter extends AbilityBase {
  protected expose(): IExposeResult {
    // Create a separate variable to hold the value for the setter
    let internalValue = 'getter setter value';
    
    return {
      // Explicitly return a getter/setter object
      explicitGetterSetter: {
        get: () => internalValue,
        set: (val: string) => { internalValue = val; },
        enumerable: true
      }
    };
  }
  
  protected onDispose(): void {
    super.onDispose();
  }
}

describe('AbilityBase', () => {
  describe('precompile', () => {
    it('should create precompiled ability with descriptorFactories', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      
      expect(precompiled.descriptorFactories).toBeDefined();
      expect(precompiled.createDisposer).toBeDefined();
    });

    it('should create descriptor factories for all exposed properties', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      
      expect(precompiled.descriptorFactories.has('injectedProp')).toBe(true);
      expect(precompiled.descriptorFactories.has('injectedMethod')).toBe(true);
      expect(precompiled.descriptorFactories.has('testProperty')).toBe(true);
      expect(precompiled.descriptorFactories.has('testMethod')).toBe(true);
    });

    it('should handle symbol properties', () => {
      const ability = new TestAbilityWithSymbol();
      const precompiled = ability.precompile();
      
      expect(precompiled.descriptorFactories.has('injectedProp')).toBe(true);
      expect(precompiled.descriptorFactories.has('injectedMethod')).toBe(true);
    });
    
    it('should handle getter/setter properties', () => {
      const ability = new TestAbilityWithGetterSetter();
      const precompiled = ability.precompile();
      
      expect(precompiled.descriptorFactories.has('explicitGetterSetter')).toBe(true);
    });
  });

  describe('descriptor factories', () => {
    it('should create working descriptors for simple values', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      const host = new TestHost();
      
      const factory = precompiled.descriptorFactories.get('injectedProp');
      const descriptor = factory!(host);
      
      expect(descriptor.value).toBe('injected value');
    });

    it('should create working descriptors for methods', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      const host = new TestHost();
      
      const factory = precompiled.descriptorFactories.get('injectedMethod');
      const descriptor = factory!(host);
      
      expect(typeof descriptor.value).toBe('function');
      expect(descriptor.value()).toBe('injected method');
    });

    it('should create working descriptors for getter/setter', () => {
      const ability = new TestAbilityWithGetterSetter();
      const precompiled = ability.precompile();
      const host = new TestHost();
      
      const factory = precompiled.descriptorFactories.get('explicitGetterSetter');
      const descriptor = factory!(host);
      
      expect(descriptor.get).toBeDefined();
      expect(descriptor.set).toBeDefined();
      expect(descriptor.get!()).toBe('getter setter value');
      
      // Test setter
      descriptor.set!('new value');
      expect(descriptor.get!()).toBe('new value');
    });
  });

  describe('disposer', () => {
    it('should create disposer function', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      const host = new TestHost();
      
      const disposer = precompiled.createDisposer!(host);
      expect(typeof disposer).toBe('function');
    });

    it('should call onDispose when disposer is called', () => {
      // Create a test ability that tracks if onDispose was called
      class TestDisposeTrackingAbility extends AbilityBase {
        disposed = false;
        
        protected expose(): IExposeResult {
          return {};
        }
        
        protected onDispose(): void {
          super.onDispose();
          this.disposed = true;
        }
      }
      
      const ability = new TestDisposeTrackingAbility();
      const precompiled = ability.precompile();
      const host = new TestHost();
      
      const disposer = precompiled.createDisposer!(host);
      disposer();
      
      expect(ability.disposed).toBe(true);
    });
  });
});
