import { WorkerError } from '@/task/errors/WorkerError';

describe('WorkerError', () => {
  it('should create an instance with correct properties', () => {
    const message = 'Worker failed to start';
    const context = { url: 'test-worker.js', originalError: 'Permission denied' };
    
    const error = new WorkerError(message, context);
    
    expect(error).toBeInstanceOf(WorkerError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.code).toBe('WORKER_ERROR');
    expect(error.context).toEqual(context);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should create an instance without context', () => {
    const message = 'Worker failed to start';
    
    const error = new WorkerError(message);
    
    expect(error).toBeInstanceOf(WorkerError);
    expect(error.message).toBe(message);
    expect(error.code).toBe('WORKER_ERROR');
    expect(error.context).toBeUndefined();
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should have correct name property', () => {
    const error = new WorkerError('Test message');
    
    expect(error.name).toBe('WorkerError');
  });

  it('should support toString method', () => {
    const message = 'Worker failed to start';
    const context = { url: 'test-worker.js' };
    const error = new WorkerError(message, context);
    
    const errorString = error.toString();
    
    expect(errorString).toContain('[WorkerError]');
    expect(errorString).toContain('(WORKER_ERROR)');
    expect(errorString).toContain(message);
    expect(errorString).toContain(JSON.stringify(context));
  });

  it('should support toJSON method', () => {
    const message = 'Worker failed to start';
    const context = { url: 'test-worker.js' };
    const error = new WorkerError(message, context);
    
    const errorJson = error.toJSON();
    
    expect(errorJson.name).toBe('WorkerError');
    expect(errorJson.message).toBe(message);
    expect(errorJson.code).toBe('WORKER_ERROR');
    expect(errorJson.context).toEqual(context);
    expect(errorJson.timestamp).toBeDefined();
    expect(errorJson.stack).toBeDefined();
  });

  it('should maintain proper prototype chain', () => {
    const error = new WorkerError('Test message');
    
    expect(error).toBeInstanceOf(WorkerError);
    expect(error).toBeInstanceOf(Error);
    // 检查原型链
    expect(Object.getPrototypeOf(error)).toBe(WorkerError.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(require('@/error/ErrorBase').ErrorBase.prototype);
  });
});