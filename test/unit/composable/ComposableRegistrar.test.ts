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
    return this;b
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

import { ComposableRegistrar } from '@/composable/ComposableRegistrar';
import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult, IPrecompiledAbility } from '@/composable/types/composable';

// Create a test ability
class TestAbility extends AbilityBase {
  readonly name = 'TestAbility';
  
  protected expose(): IExposeResult {
    return {
      testProp: 'test value'
    };
  }
}

// Create another test ability
class AnotherAbility extends AbilityBase {
  readonly name = 'AnotherAbility';
  
  protected expose(): IExposeResult {
    return {
      anotherProp: 'another value'
    };
  }
}

describe('ComposableRegistrar', () => {
  let registrar: ComposableRegistrar;

  beforeEach(() => {
    // Get a fresh instance for each test
    registrar = ComposableRegistrar.getInstance();
    registrar.clear();
  });

  afterEach(() => {
    registrar.clear();
    jest.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ComposableRegistrar.getInstance();
      const instance2 = ComposableRegistrar.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should have correct name', () => {
      expect(registrar.name).toBe('ComposableRegistrar');
    });
  });

  describe('register', () => {
    it('should register an ability', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      expect(registrar.has('TestAbility')).toBe(true);
    });

    it('should store ability entry correctly', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const entry = registrar.get('TestAbility');
      expect(entry).toBeDefined();
      expect(entry?.name).toBe('TestAbility');
      expect(entry?.abilityClass).toBe(TestAbility);
    });

    it('should support immediate precompilation', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility,
        { immediate: true }
      );
      
      // Should be precompiled immediately
      const precompiled = registrar.getPrecompiled('TestAbility');
      expect(precompiled).toBeDefined();
    });
  });

  describe('unregister', () => {
    it('should unregister an ability', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      expect(registrar.has('TestAbility')).toBe(true);
      
      registrar.unregister('TestAbility');
      
      expect(registrar.has('TestAbility')).toBe(false);
    });

    it('should clear all caches when unregistering', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      // Precompile to populate cache
      registrar.getPrecompiled('TestAbility');
      
      registrar.unregister('TestAbility');
      
      // Should not be in any cache
      expect(registrar.get('TestAbility')).toBeUndefined();
      expect(registrar.getPrecompiled('TestAbility')).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent ability', () => {
      const entry = registrar.get('NonExistent');
      expect(entry).toBeUndefined();
    });

    it('should return entry for registered ability', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const entry = registrar.get('TestAbility');
      expect(entry).toBeDefined();
      expect(entry?.name).toBe('TestAbility');
    });
  });

  describe('getPrecompiled', () => {
    it('should return undefined for non-existent ability', () => {
      const precompiled = registrar.getPrecompiled('NonExistent');
      expect(precompiled).toBeUndefined();
    });

    it('should precompile ability on first call', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const precompiled = registrar.getPrecompiled('TestAbility');
      
      expect(precompiled).toBeDefined();
      expect(precompiled?.name).toBe('TestAbility');
      expect(precompiled?.descriptorFactories).toBeDefined();
      expect(precompiled?.createDisposer).toBeDefined();
    });

    it('should cache precompiled result', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const precompiled1 = registrar.getPrecompiled('TestAbility');
      const precompiled2 = registrar.getPrecompiled('TestAbility');
      
      // Should be the same cached result
      expect(precompiled1).toBe(precompiled2);
    });

    it('should cache ability instance', () => {
      // Track how many times the constructor is called
      let constructorCalls = 0;
      
      class TrackedAbility extends AbilityBase {
        readonly name = 'TrackedAbility';
        
        constructor() {
          super();
          constructorCalls++;
        }
        
        protected expose(): IExposeResult {
          return {};
        }
      }
      
      registrar.register(
        { name: 'TrackedAbility', ctor: TrackedAbility },
        TrackedAbility
      );
      
      // First call - should instantiate
      const precompiled1 = registrar.getPrecompiled('TrackedAbility');
      expect(constructorCalls).toBe(1);
      
      // Second call - should use cached instance
      const precompiled2 = registrar.getPrecompiled('TrackedAbility');
      expect(constructorCalls).toBe(1); // Still 1, not 2
      
      // Both should be the same
      expect(precompiled1).toBe(precompiled2);
    });

    it('should handle ability instance (not constructor)', () => {
      const abilityInstance = new TestAbility();
      
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        abilityInstance  // Pass instance instead of constructor
      );
      
      const precompiled = registrar.getPrecompiled('TestAbility');
      expect(precompiled).toBeDefined();
      expect(precompiled?.name).toBe('TestAbility');
    });
  });

  describe('getRecursive', () => {
    it('should return empty array for empty input', () => {
      const entries = registrar.getRecursive([]);
      expect(entries).toEqual([]);
    });

    it('should return entries for registered abilities', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      registrar.register(
        { name: 'AnotherAbility', ctor: AnotherAbility },
        AnotherAbility
      );
      
      const entries = registrar.getRecursive(['TestAbility', 'AnotherAbility']);
      
      expect(entries).toHaveLength(2);
      expect(entries[0].name).toBe('TestAbility');
      expect(entries[1].name).toBe('AnotherAbility');
    });

    it('should filter out non-existent abilities', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      const entries = registrar.getRecursive(['TestAbility', 'NonExistent']);
      
      expect(entries).toHaveLength(1);
      expect(entries[0].name).toBe('TestAbility');
    });
  });

  describe('has', () => {
    it('should return false for non-existent ability', () => {
      expect(registrar.has('NonExistent')).toBe(false);
    });

    it('should return true for registered ability', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      expect(registrar.has('TestAbility')).toBe(true);
    });
  });

  describe('getAllNames', () => {
    it('should return empty array when no abilities registered', () => {
      const names = registrar.getAllNames();
      expect(names).toEqual([]);
    });

    it('should return all registered ability names', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      registrar.register(
        { name: 'AnotherAbility', ctor: AnotherAbility },
        AnotherAbility
      );
      
      const names = registrar.getAllNames();
      
      expect(names).toHaveLength(2);
      expect(names).toContain('TestAbility');
      expect(names).toContain('AnotherAbility');
    });
  });

  describe('clearCaches', () => {
    it('should clear all caches', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      // Populate caches
      registrar.getPrecompiled('TestAbility');
      
      // Clear caches
      registrar.clearCaches();
      
      // Caches should be empty
      // Note: We can't directly check private members, but we can verify behavior
      const precompiled = registrar.getPrecompiled('TestAbility');
      expect(precompiled).toBeDefined(); // Should still work, but will recompile
    });
  });

  describe('inspect', () => {
    it('should output registrar state', () => {
      registrar.register(
        { name: 'TestAbility', ctor: TestAbility },
        TestAbility
      );
      
      // Just verify it doesn't throw
      expect(() => registrar.inspect()).not.toThrow();
    });
  });
});
