import { DefaultWorkerPool } from '@/task/hash-task/worker/DefaultWorkerPool';
import { DefaultWorkerHandle } from '@/task/hash-task/worker/DefaultWorkerHandle';
import { WorkerHandle } from '@/task/hash-task/worker/WorkerHandle';

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

// Mock the Worker API globally
jest.mock('@/task/hash-task/worker/DefaultWorkerHandle', () => {
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
      } as unknown as WorkerHandle; // Cast to WorkerHandle to match interface
    }),
  };
});

describe('DefaultWorkerPool', () => {
  let originalWorker: any;

  beforeAll(() => {
    originalWorker = (global as any).Worker;
    (global as any).Worker = MockWorker;
  });

  afterAll(() => {
    (global as any).Worker = originalWorker;
  });

  test('should create a pool with default maxWorkers', () => {
    const pool = new DefaultWorkerPool();
    expect((pool as any).maxWorkers).toBe(4); // hardwareConcurrency is 4
  });

  test('should create a pool with default maxWorkers when hardwareConcurrency is 0', () => {
    // Temporarily modify navigator to have 0 hardwareConcurrency
    Object.defineProperty(window, 'navigator', {
      value: {
        hardwareConcurrency: 0,
      },
      writable: true,
    });
    
    const pool = new DefaultWorkerPool();
    expect((pool as any).maxWorkers).toBe(4); // Should fallback to Math.min(4, 8) = 4
    
    // Restore original value
    Object.defineProperty(window, 'navigator', {
      value: {
        hardwareConcurrency: 4,
      },
      writable: true,
    });
  });

  test('should create a pool with default maxWorkers when hardwareConcurrency is undefined', () => {
    // Temporarily modify navigator to have undefined hardwareConcurrency
    Object.defineProperty(window, 'navigator', {
      value: {
        hardwareConcurrency: undefined,
      },
      writable: true,
    });
    
    const pool = new DefaultWorkerPool();
    expect((pool as any).maxWorkers).toBe(4); // Should fallback to Math.min(4, 8) = 4
    
    // Restore original value
    Object.defineProperty(window, 'navigator', {
      value: {
        hardwareConcurrency: 4,
      },
      writable: true,
    });
  });

  test('should create a pool with specified maxWorkers', () => {
    const pool = new DefaultWorkerPool(2);
    expect((pool as any).maxWorkers).toBe(2);
  });

  test('should acquire a new worker when available', async () => {
    const pool = new DefaultWorkerPool(2);
    const scriptSource = 'console.log("hello world");';

    const worker = await pool.acquire(scriptSource);

    expect(worker).toBeDefined();
    expect(DefaultWorkerHandle).toHaveBeenCalledWith(scriptSource);
    expect((pool as any).allWorkers.size).toBe(1);
  });

  test('should reuse idle worker', async () => {
    const pool = new DefaultWorkerPool(2);
    const scriptSource = 'console.log("hello world");';

    // Acquire first worker
    const worker1 = await pool.acquire(scriptSource);
    expect((pool as any).allWorkers.size).toBe(1);

    // Release the worker
    pool.release(worker1);
    expect((pool as any).idleWorkers.length).toBe(1);

    // Acquire again - should get the idle worker
    const worker2 = await pool.acquire(scriptSource);
    expect(worker2).toBe(worker1);
    expect((pool as any).idleWorkers.length).toBe(0);
  });

  test('should create new workers up to max limit', async () => {
    const pool = new DefaultWorkerPool(2);
    const scriptSource = 'console.log("hello world");';

    const workers = await Promise.all([
      pool.acquire(scriptSource),
      pool.acquire(scriptSource),
    ]);

    expect(workers.length).toBe(2);
    expect((pool as any).allWorkers.size).toBe(2);
  });

  test('should queue when max workers reached', async () => {
    const pool = new DefaultWorkerPool(2);
    const scriptSource = 'console.log("hello world");';

    // Acquire max workers
    await Promise.all([
      pool.acquire(scriptSource),
      pool.acquire(scriptSource),
    ]);

    // Try to acquire more - this should create a promise that waits
    const acquirePromise = pool.acquire(scriptSource);

    // Release a worker - the waiting promise should resolve
    const [worker] = Array.from((pool as any).allWorkers) as WorkerHandle[];
    pool.release(worker);

    const newWorker = await acquirePromise;
    expect(newWorker).toBe(worker);
  });

  test('should destroy pool and terminate all workers', async () => {
    const pool = new DefaultWorkerPool(3);
    const scriptSource = 'console.log("hello world");';

    // Acquire some workers
    const workers = await Promise.all([
      pool.acquire(scriptSource),
      pool.acquire(scriptSource),
    ]);

    const terminateSpies = workers.map(worker => jest.spyOn(worker, 'terminate'));

    await pool.destroy();

    // Check that all workers were terminated
    terminateSpies.forEach(spy => {
      expect(spy).toHaveBeenCalled();
    });

    // Check internal state is cleared
    expect((pool as any).isDestroyed).toBe(true);
    expect((pool as any).allWorkers.size).toBe(0);
    expect((pool as any).idleWorkers.length).toBe(0);
    expect((pool as any).waiters.length).toBe(0);
  });

  test('should terminate worker when returned to destroyed pool', async () => {
    const pool = new DefaultWorkerPool(2);
    const scriptSource = 'console.log("hello world");';

    const worker = await pool.acquire(scriptSource);
    const terminateSpy = jest.spyOn(worker, 'terminate');

    // Destroy the pool first
    await pool.destroy();

    // Try to return a worker - it should be terminated
    pool.release(worker);
    expect(terminateSpy).toHaveBeenCalled();
  });

  test('should throw error when acquiring from destroyed pool', async () => {
    const pool = new DefaultWorkerPool(2);
    await pool.destroy();

    await expect(pool.acquire('console.log("test");')).rejects.toThrow('WorkerPool is destroyed');
  });
});