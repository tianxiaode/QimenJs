import { BrowserWorkerPool } from '@/tasks/hash-task/worker/BrowserWorkerPool';

// Mock the Worker API
class MockWorker {
  listeners: { [key: string]: Function[] } = {};
  terminated = false;

  constructor(public scriptURL: string | URL) {}

  postMessage(message: any, transfer?: Transferable[]) {
    // Mock postMessage
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    if (this.listeners[type]) {
      const index = this.listeners[type].indexOf(listener);
      if (index !== -1) {
        this.listeners[type].splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach((listener: Function) => listener(event));
    }
  }

  terminate() {
    this.terminated = true;
  }
}

// Mock the navigator.hardwareConcurrency
Object.defineProperty(window, 'navigator', {
  value: {
    hardwareConcurrency: 4,
  },
  writable: true,
});

// Mock the DefaultWorkerHandle to prevent actual instantiation
jest.mock('@/tasks/hash-task/worker/DefaultWorkerHandle', () => {
  return {
    DefaultWorkerHandle: jest.fn().mockImplementation((scriptSource: string) => {
      return {
        id: `worker-${Math.random().toString(36).slice(2, 11)}`,
        post: jest.fn(),
        onMessage: jest.fn(() => jest.fn()),
        onError: jest.fn(() => jest.fn()),
        terminate: jest.fn(),
        isAlive: jest.fn(() => true),
        scriptSource, // for verification
      };
    }),
  };
});

describe('BrowserWorkerPool', () => {
  let originalWorker: any;

  beforeAll(() => {
    originalWorker = (global as any).Worker;
    (global as any).Worker = MockWorker;
  });

  afterAll(() => {
    (global as any).Worker = originalWorker;
  });

  test('should create a pool with default size', () => {
    const pool = new BrowserWorkerPool();
    expect((pool as any).maxWorkers).toBe(4); // hardwareConcurrency is 4
  });

  test('should create a pool with specified size', () => {
    const pool = new BrowserWorkerPool(2);
    expect((pool as any).maxWorkers).toBe(2);
  });

  test('should inherit from DefaultWorkerPool', () => {
    const pool = new BrowserWorkerPool();
    expect(pool).toBeInstanceOf(require('@/tasks/hash-task/worker/DefaultWorkerPool').DefaultWorkerPool);
  });

  test('should acquire and release workers properly', async () => {
    const pool = new BrowserWorkerPool(2);
    const scriptSource = 'console.log("hello world");';

    // Acquire a worker
    const worker = await pool.acquire(scriptSource);
    expect(worker).toBeDefined();

    // Release the worker
    pool.release(worker);

    // Acquire again - should work
    const worker2 = await pool.acquire(scriptSource);
    expect(worker2).toBeDefined();
  });

  test('should destroy properly', async () => {
    const pool = new BrowserWorkerPool(1);
    const scriptSource = 'console.log("hello world");';

    // Acquire a worker
    const worker = await pool.acquire(scriptSource);
    const terminateSpy = jest.spyOn(worker, 'terminate');

    // Destroy the pool
    await pool.destroy();

    // Check that worker was terminated
    expect(terminateSpy).toHaveBeenCalled();
  });
});