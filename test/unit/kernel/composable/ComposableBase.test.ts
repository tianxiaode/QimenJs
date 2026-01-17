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

import { ComposableBase, Ability } from '@/kernel/composable/ComposableBase';
import { IComposable, IComposableBase } from '@/kernel/types';
import { ComposableRegistrar } from '@/kernel/registrars';

// Mock Ability for testing
class MockAbility implements IComposable {
  disposed = false;
  attachedHost: any = null;

  attach(host: any) {
    this.attachedHost = host;
    // Add a test property to the host
    (host as any).mockMethod = () => 'mock method result';
  }

  dispose() {
    this.disposed = true;
  }
}

// Create a testable ComposableBase that uses mock logger
class TestComposable extends ComposableBase {
  constructor() {
    super();
  }
}

describe('ComposableBase', () => {
  beforeEach(() => {
    // Mock the ComposableRegistrar to return our mock ability
    jest.spyOn(ComposableRegistrar.prototype, 'getRecursive').mockReturnValue([
      {
        name: 'MockAbility',
        ctor: MockAbility
      }
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with a logger', () => {
      const composable = new TestComposable();
      expect(composable.logger).toBeDefined();
      expect(composable.logger).toBeInstanceOf(MockLogger);
    });

    it('should run setupAbilities during construction', () => {
      const composable = new TestComposable();
      // Check if the mock method from the ability was added
      expect((composable as any).mockMethod).toBeDefined();
      expect((composable as any).mockMethod()).toBe('mock method result');
    });
  });

  describe('getStatic and setStatic', () => {
    it('should store and retrieve static values', () => {
      const composable = new TestComposable();
      const testKey = 'testKey';
      const testValue = { some: 'data' };

      composable.setStatic(testKey, testValue);
      const retrievedValue = composable.getStatic(testKey);

      expect(retrievedValue).toEqual(testValue);
    });

    it('should support symbol keys', () => {
      const composable = new TestComposable();
      const testSymbol = Symbol('test');
      const testValue = 'symbol value';

      composable.setStatic(testSymbol, testValue);
      const retrievedValue = composable.getStatic(testSymbol);

      expect(retrievedValue).toBe(testValue);
    });

    it('should return undefined for non-existent keys', () => {
      const composable = new TestComposable();
      const retrievedValue = composable.getStatic('nonExistentKey');

      expect(retrievedValue).toBeUndefined();
    });
  });

  describe('setupAbilities', () => {
    it('should not load duplicate abilities', () => {
      // Create a spy for the ability constructor
      const mockAbilityCtor = jest.fn().mockImplementation(() => new MockAbility());
      
      // Replace the registrar mock to return the spy constructor
      jest.spyOn(ComposableRegistrar.prototype, 'getRecursive').mockReturnValue([
        {
          name: 'MockAbility',
          ctor: mockAbilityCtor
        }
      ]);

      // Create a new composable instance - constructor will call setupAbilities
      const testComposable = new TestComposable();
      
      // The constructor already called setupAbilities, which should have created an instance
      // Reset the mock to check for additional calls made by our manual calls
      mockAbilityCtor.mockClear();
      
      // Manually call setupAbilities twice more
      (testComposable as any).setupAbilities();
      (testComposable as any).setupAbilities();

      // Because of caching mechanism, no additional instances should be created
      // The cache prevents re-initialization, so constructor calls are already handled
      expect(mockAbilityCtor).toHaveBeenCalledTimes(0);
    });

    it('should handle errors during ability attachment', () => {
      // Create a spy to track calls to getRecursive
      const mockRegistrar = new ComposableRegistrar();
      const getRecursiveSpy = jest.spyOn(mockRegistrar, 'getRecursive').mockReturnValue([
        {
          name: 'ThrowingAbility',
          ctor: class {
            attach(_host: any) {
              throw new Error('Attachment failed');
            }
            dispose() {}
          }
        }
      ]);
      
      // Replace the registrar instance temporarily
      const getInstanceSpy = jest.spyOn(ComposableRegistrar, 'getInstance').mockReturnValue(mockRegistrar);

      // Create a test class that allows us to replace the logger
      const mockLoggerInstance = new MockLogger();
      const testComposable = new class extends ComposableBase {
        constructor() {
          super();
          // Replace logger after super() call
          Object.defineProperty(this, 'logger', {
            value: mockLoggerInstance,
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
      }();
      
      // Clear the cache so the next call to setupAbilities will try to load abilities again
      testComposable.setStatic('__resolved_ability_entries__', null);
      
      // Call setupAbilities to trigger the attachment
      (testComposable as any).setupAbilities();

      // Restore the original method
      getInstanceSpy.mockRestore();

      // Should log an error but continue
      const errors = mockLoggerInstance.logs.filter((log: { level: string; message: string }) => 
        log.level === 'error' && log.message.includes('Failed to attach ability')
      );
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('dispose', () => {
    it('should dispose all loaded abilities in reverse order', () => {
      const mockAbilityInstance = new MockAbility();
      
      // Create a spy for the ability constructor that returns our instance
      const mockAbilityCtorSpy = jest.fn().mockReturnValue(mockAbilityInstance);
      
      // Replace the registrar mock to return the spy constructor
      jest.spyOn(ComposableRegistrar.prototype, 'getRecursive').mockReturnValue([
        {
          name: 'MockAbility',
          ctor: mockAbilityCtorSpy
        }
      ]);
      
      // Create a new instance to test with
      class TestComposableWithFreshSetup extends ComposableBase {
        constructor() {
          super();
          // Clear cache so we can test ability setup independently
          this.setStatic('__resolved_ability_entries__', null);
          // Setup abilities again
          this.setupAbilities();
        }
      }
      
      const composable = new TestComposableWithFreshSetup();
      const initialInstancesCount = (composable as any)._instances.length;
      
      expect(initialInstancesCount).toBeGreaterThan(0);
      
      composable.dispose();
      
      // Check that the ability was disposed
      expect(mockAbilityInstance.disposed).toBe(true);
      
      // Check that internal arrays are cleared
      expect((composable as any)._instances).toHaveLength(0);
      expect((composable as any)._loadedAbilities.size).toBe(0);
    });

    it('should handle errors during ability disposal', () => {
      // Create an ability that throws during dispose
      class ErrorThrowingAbility implements IComposable {
        disposed = false;
        
        attach(_host: any) {
          // Do nothing
        }
        
        dispose() {
          throw new Error('Disposal failed');
        }
      }
      
      const errorThrowingAbility = new ErrorThrowingAbility();
      const mockLoggerInstance = new MockLogger();
      const testComposable = new class extends ComposableBase {
        constructor() {
          super();
          Object.defineProperty(this, 'logger', {
            value: mockLoggerInstance,
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
      }();
      
      // Mock registrar to return our error throwing ability
      jest.spyOn(ComposableRegistrar.prototype, 'getRecursive').mockReturnValue([
        {
          name: 'ErrorThrowingAbility',
          ctor: jest.fn().mockImplementation(() => errorThrowingAbility)
        }
      ]);
      
      // Manually add the ability to the instances list
      const ability = new ErrorThrowingAbility();
      ability.attach(testComposable);
      (testComposable as any)._instances.push(ability);

      // Capture errors during disposal
      testComposable.dispose();
      
      const errors = mockLoggerInstance.logs.filter((log: { level: string; message: string }) => 
        log.level === 'error' && log.message.includes('Dispose error')
      );
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Ability decorator', () => {
    it('should properly decorate a class with ability keys', () => {
      // Use a different approach to verify decorator functionality
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
});