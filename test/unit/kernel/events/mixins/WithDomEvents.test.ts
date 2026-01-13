// 定义 Constructor 类型，用于混入模式
type Constructor<T = {}> = new (...args: any[]) => T;

import { DisposableBase } from '@orbitjs/utils';
import { WithDomEvents } from '@/kernel/events/mixins/WithDomEvents';
import { WithEvents } from '@/kernel/events/mixins/WithEvents';
import { globalEventBus } from '@/kernel/events/core/GlobalEventBus';
import { GestureSemantic } from '@/kernel/events/adapters';

// Mock the createEventAdapter function
jest.mock('@/kernel/events/adapters', () => {
  const actualAdapters = jest.requireActual('@/kernel/events/adapters');
  return {
    ...actualAdapters,
    createEventAdapter: jest.fn(() => ({
      bind: jest.fn(),
    })),
  };
});

// Mock EventScope to simulate the event scope behavior
jest.mock('@/kernel/events/core/GlobalEventBus', () => {
  const actualGlobalEventBus = jest.requireActual('@/kernel/events/core/GlobalEventBus');
  return {
    ...actualGlobalEventBus,
    globalEventBus: {
      createEventScope: () => ({
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        dispose: jest.fn(),
      }),
    },
  };
});

// Import the mocked function
const { createEventAdapter } = jest.requireMock('@/kernel/events/adapters');

// Create a test class that extends DisposableBase
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

// Apply the WithDomEvents mixin to the test class
const TestClassWithDomEvents = WithDomEvents(TestClass as Constructor<TestClass>);

// Define a type representing TestClass with WithDomEvents mixin
type TestClassWithDomEventsType = InstanceType<typeof TestClassWithDomEvents> & { 
  value: number; 
  increment: () => void;
};

describe('WithDomEvents Mixin', () => {
  let instance: TestClassWithDomEventsType;

  beforeEach(() => {
    // Since mixin function returns an abstract class, we need to create a concrete implementation
    const ConcreteClass = class extends TestClassWithDomEvents {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    instance = new ConcreteClass() as unknown as TestClassWithDomEventsType;
  });

  afterEach(() => {
    // Clean up the instance after each test
    instance.dispose();
  });

  test('should create an instance with the mixin applied', () => {
    expect(instance).toBeDefined();
    expect(instance.bind).toBeDefined();
    expect(typeof instance.bind).toBe('function');
  });

  test('should fail to bind if eventScope is not available', () => {
    // Create an instance without WithEvents mixin (which provides eventScope)
    const ConcreteClassWithoutEvents = class extends TestClassWithDomEvents {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    const instanceWithoutEvents = new ConcreteClassWithoutEvents() as unknown as TestClassWithDomEventsType;
    
    expect(() => {
      instanceWithoutEvents.bind({}, 'click');
    }).toThrow(
      'WithDomEvents requires WithEvents to be mixed in first or eventScope to be defined.'
    );
  });

  test('should successfully bind to an event when combined with WithEvents', () => {
    // Combine WithDomEvents with WithEvents to provide eventScope
    const CombinedTestClass = WithDomEvents(WithEvents(TestClass as Constructor<TestClass>));
    
    type CombinedTestType = InstanceType<typeof CombinedTestClass> & {
      value: number;
      increment: () => void;
    };
    
    const ConcreteCombinedClass = class extends CombinedTestClass {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    const combinedInstance = new ConcreteCombinedClass() as unknown as CombinedTestType;
    
    // Mock the adapter's bind method
    const adapterBindSpy = jest.fn();
    (combinedInstance as any)._adapter = { bind: adapterBindSpy };
    
    const target = {};
    const semantic: GestureSemantic = 'tap';
    const options = { passive: true };
    
    // Call bind method
    combinedInstance.bind(target, semantic, options);
    
    // Verify that adapter.bind was called with the correct arguments
    expect(adapterBindSpy).toHaveBeenCalledWith(target, semantic, expect.anything(), options);
    
    combinedInstance.dispose();
  });

  test('should create adapter lazily when accessed', () => {
    // Mock createEventAdapter to track calls
    (createEventAdapter as jest.MockedFunction<any>).mockClear();
    (createEventAdapter as jest.MockedFunction<any>).mockReturnValue({
      bind: jest.fn(),
    });
    
    // Combine WithDomEvents with WithEvents to provide eventScope
    const CombinedTestClass = WithDomEvents(WithEvents(TestClass as Constructor<TestClass>));
    
    type CombinedTestType = InstanceType<typeof CombinedTestClass> & {
      value: number;
      increment: () => void;
    };
    
    const ConcreteCombinedClass = class extends CombinedTestClass {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    const combinedInstance = new ConcreteCombinedClass() as unknown as CombinedTestType;
    
    // Access adapter property to trigger lazy initialization
    const adapter1 = (combinedInstance as any).adapter;
    const adapter2 = (combinedInstance as any).adapter;
    
    // Verify that createEventAdapter was called only once
    expect(createEventAdapter).toHaveBeenCalledTimes(1);
    
    combinedInstance.dispose();
  });

  test('should call parent dispose if it exists', () => {
    // Create a test class with a custom dispose method
    class TestClassWithDispose extends DisposableBase {
      disposed = false;
      
      dispose() {
        super.dispose();
        this.disposed = true;
      }
    }
    
    const TestClassWithDomEventsAndDispose = WithDomEvents(TestClassWithDispose as Constructor<TestClassWithDispose>);
    
    const ConcreteDisposeClass = class extends TestClassWithDomEventsAndDispose {
      constructor() {
        super();
      }
    };
    
    const instanceWithDispose = new ConcreteDisposeClass() as unknown as TestClassWithDispose;
    
    // Initially, disposed flag should be false
    expect(instanceWithDispose.disposed).toBe(false);
    
    // Call dispose
    instanceWithDispose.dispose();
    
    // Now, disposed flag should be true
    expect(instanceWithDispose.disposed).toBe(true);
  });

  test('should handle multiple calls to dispose gracefully', () => {
    // Create an instance
    const ConcreteClass = class extends TestClassWithDomEvents {
      constructor(value: number = 0) {
        super(value);
      }
    };
    
    const instance = new ConcreteClass() as unknown as TestClassWithDomEventsType;
    
    // Calling dispose multiple times should not throw
    expect(() => {
      instance.dispose();
      instance.dispose();
    }).not.toThrow();
  });
});