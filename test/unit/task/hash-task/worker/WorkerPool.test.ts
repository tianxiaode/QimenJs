import { WorkerPool } from '@/task/hash-task/worker/WorkerPool';
import { WorkerHandle } from '@/task/hash-task/worker/WorkerHandle';

// Create a mock implementation of WorkerPool for testing
class MockWorkerPool implements WorkerPool {
  workers: WorkerHandle[] = [];
  acquiredWorkers: WorkerHandle[] = [];
  destroyed = false;

  async acquire(scriptSource: string): Promise<WorkerHandle> {
    if (this.destroyed) {
      throw new Error('WorkerPool is destroyed');
    }

    // Create a mock worker handle
    const mockWorker: WorkerHandle = {
      id: `mock-worker-${Math.random().toString(36).substr(2, 9)}`,
      post: jest.fn(),
      onMessage: jest.fn(() => jest.fn()),
      onError: jest.fn(() => jest.fn()),
      terminate: jest.fn(async () => Promise.resolve()),
      isAlive: jest.fn(() => true),
    };

    this.acquiredWorkers.push(mockWorker);
    return mockWorker;
  }

  release(worker: WorkerHandle): void {
    const index = this.acquiredWorkers.indexOf(worker);
    if (index !== -1) {
      this.acquiredWorkers.splice(index, 1);
      this.workers.push(worker);
    }
  }

  async destroy(): Promise<void> {
    this.destroyed = true;
    this.workers = [];
    this.acquiredWorkers = [];
  }
}

describe('WorkerPool Interface', () => {
  let pool: MockWorkerPool;

  beforeEach(() => {
    pool = new MockWorkerPool();
  });

  test('should define the correct interface methods', () => {
    expect(typeof pool.acquire).toBe('function');
    expect(typeof pool.release).toBe('function');
    expect(typeof pool.destroy).toBe('function');
  });

  test('should acquire a worker', async () => {
    const scriptSource = 'console.log("hello world");';
    const worker = await pool.acquire(scriptSource);

    expect(worker).toBeDefined();
    expect(worker.id).toMatch(/^mock-worker-[a-z0-9]{9}$/);
    expect(typeof worker.post).toBe('function');
    expect(typeof worker.onMessage).toBe('function');
    expect(typeof worker.onError).toBe('function');
    expect(typeof worker.terminate).toBe('function');
    expect(typeof worker.isAlive).toBe('function');

    expect(pool.acquiredWorkers).toContain(worker);
  });

  test('should release a worker back to the pool', async () => {
    const scriptSource = 'console.log("hello world");';
    const worker = await pool.acquire(scriptSource);

    pool.release(worker);

    expect(pool.acquiredWorkers).not.toContain(worker);
    expect(pool.workers).toContain(worker);
  });

  test('should destroy the pool', async () => {
    const scriptSource = 'console.log("hello world");';
    const worker = await pool.acquire(scriptSource);

    await pool.destroy();

    expect(pool.destroyed).toBe(true);
    expect(pool.workers.length).toBe(0);
    expect(pool.acquiredWorkers.length).toBe(0);
  });

  test('should throw error when acquiring from destroyed pool', async () => {
    await pool.destroy();

    await expect(pool.acquire('test')).rejects.toThrow('WorkerPool is destroyed');
  });
});