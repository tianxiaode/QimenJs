import { BrowserWorkerHandle } from '@/tasks/hash-task/worker/BrowserWorkerHandle';

// 模拟 Worker API
class MockWorker {
  listeners: { [key: string]: Function[] } = {};
  terminated = false;

  constructor(public scriptURL: string) {}

  postMessage(message: any, transfer?: Transferable[]) {
    // 模拟 postMessage
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

describe('BrowserWorkerHandle', () => {
  let originalWorker: any;

  beforeAll(() => {
    originalWorker = (global as any).Worker;
    (global as any).Worker = MockWorker;
  });

  afterAll(() => {
    (global as any).Worker = originalWorker;
  });

  test('should create a worker handle with unique ID', () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    expect(handle.id).toMatch(/^worker-[a-z0-9]{9}$/);
  });

  test('should post message to worker', () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    const mockWorker = handle['worker'] as any as MockWorker;
    const spy = jest.spyOn(mockWorker, 'postMessage');

    const message = { type: 'test', data: 'data' };
    handle.post(message);

    expect(spy).toHaveBeenCalledWith(message, []);
  });

  test('should post message with transferables', () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    const mockWorker = handle['worker'] as any as MockWorker;
    const spy = jest.spyOn(mockWorker, 'postMessage');

    const message = { type: 'test' };
    const transfer = [new ArrayBuffer(8)];
    handle.post(message, transfer);

    expect(spy).toHaveBeenCalledWith(message, transfer);
  });

  test('should register and unregister message handler', () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    const mockWorker = handle['worker'] as any as MockWorker;
    const handler = jest.fn();

    const cleanup = handle.onMessage(handler);

    // Trigger a message event
    const event = { data: { type: 'response', data: 'result' } } as MessageEvent;
    mockWorker.dispatchEvent({ ...event, type: 'message' });

    expect(handler).toHaveBeenCalledWith(event.data);
    expect(handler).toHaveBeenCalledTimes(1);

    // Cleanup
    cleanup();

    // Trigger another event, handler should not be called again
    mockWorker.dispatchEvent({ ...event, type: 'message' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should register and unregister error handler', () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    const mockWorker = handle['worker'] as any as MockWorker;
    const handler = jest.fn();

    const cleanup = handle.onError(handler);

    // Trigger an error event
    const event = { message: 'Test error' } as ErrorEvent;
    mockWorker.dispatchEvent({ ...event, type: 'error' });

    expect(handler).toHaveBeenCalledWith(new Error('Test error'));
    expect(handler).toHaveBeenCalledTimes(1);

    // Cleanup
    cleanup();

    // Trigger another error, handler should not be called again
    mockWorker.dispatchEvent({ ...event, type: 'error' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should terminate worker', async () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    const mockWorker = handle['worker'] as any as MockWorker;

    await handle.terminate();
    expect(mockWorker.terminated).toBe(true);
  });

  test('should check if worker is alive', () => {
    const handle = new BrowserWorkerHandle('test-worker.js');
    expect(handle.isAlive()).toBe(true);
  });
});