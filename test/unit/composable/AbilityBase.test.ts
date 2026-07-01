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
import type { IExposeResult, IPrecompiledAbility } from '@/composable/types/composable';

// Simple host object for testing
function createTestHost() {
  return {
    testProperty: 'original value',
    testMethod() {
      return 'original method';
    },
  };
}

// Define a simple ability that exposes some properties
class TestAbility extends AbilityBase {
  protected expose(host: any): IExposeResult {
    return {
      injectedProp: 'injected value',
      injectedMethod: () => 'injected method',
      testProperty: 'conflicting value',
      testMethod: () => 'conflicting method'
    };
  }
  
  protected onDispose(host: any): void {
    super.onDispose(host);
  }
}

// Special test ability for symbol properties
class TestAbilityWithSymbol extends AbilityBase {
  protected expose(host: any): IExposeResult {
    return {
      injectedProp: 'injected value',
      injectedMethod: () => 'injected method',
      [Symbol('test')]: 'symbol value'
    };
  }
  
  protected onDispose(host: any): void {
    super.onDispose(host);
  }
}

// Test ability that creates a getter/setter property
class TestAbilityWithGetterSetter extends AbilityBase {
  protected expose(host: any): IExposeResult {
    let internalValue = 'getter setter value';
    
    return {
      explicitGetterSetter: {
        get: () => internalValue,
        set: (val: string) => { internalValue = val; },
        enumerable: true
      }
    };
  }
  
  protected onDispose(host: any): void {
    super.onDispose(host);
  }
}

describe('AbilityBase', () => {
  describe('precompile', () => {
    it('should create precompiled ability with createDescriptors and createDisposer', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      
      expect(precompiled.createDescriptors).toBeDefined();
      expect(precompiled.createDisposer).toBeDefined();
    });

    it('should create descriptors for all exposed properties', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const descriptors = precompiled.createDescriptors(host);
      
      expect(descriptors.has('injectedProp')).toBe(true);
      expect(descriptors.has('injectedMethod')).toBe(true);
      expect(descriptors.has('testProperty')).toBe(true);
      expect(descriptors.has('testMethod')).toBe(true);
    });

    it('should handle symbol properties', () => {
      const ability = new TestAbilityWithSymbol();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const descriptors = precompiled.createDescriptors(host);
      
      expect(descriptors.has('injectedProp')).toBe(true);
      expect(descriptors.has('injectedMethod')).toBe(true);
    });
    
    it('should handle getter/setter properties', () => {
      const ability = new TestAbilityWithGetterSetter();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const descriptors = precompiled.createDescriptors(host);
      
      expect(descriptors.has('explicitGetterSetter')).toBe(true);
    });
  });

  describe('descriptors', () => {
    it('should create working descriptors for simple values', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const descriptors = precompiled.createDescriptors(host);
      const descriptor = descriptors.get('injectedProp')!;
      
      expect(descriptor.value).toBe('injected value');
    });

    it('should create working descriptors for methods', () => {
      const ability = new TestAbility();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const descriptors = precompiled.createDescriptors(host);
      const descriptor = descriptors.get('injectedMethod')!;
      
      expect(typeof descriptor.value).toBe('function');
      expect(descriptor.value()).toBe('injected method');
    });

    it('should create working descriptors for getter/setter', () => {
      const ability = new TestAbilityWithGetterSetter();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const descriptors = precompiled.createDescriptors(host);
      const descriptor = descriptors.get('explicitGetterSetter')!;
      
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
      const host = createTestHost();
      
      const disposer = precompiled.createDisposer!(host);
      expect(typeof disposer).toBe('function');
    });

    it('should call onDispose when disposer is called', () => {
      class TestDisposeTrackingAbility extends AbilityBase {
        disposed = false;
        disposedHost: any = null;
        
        protected expose(host: any): IExposeResult {
          return {};
        }
        
        protected onDispose(host: any): void {
          super.onDispose(host);
          this.disposed = true;
          this.disposedHost = host;
        }
      }
      
      const ability = new TestDisposeTrackingAbility();
      const precompiled = ability.precompile();
      const host = createTestHost();
      
      const disposer = precompiled.createDisposer!(host);
      disposer();
      
      expect(ability.disposed).toBe(true);
      expect(ability.disposedHost).toBe(host);
    });
  });
});
