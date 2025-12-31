import { WorkerInitializationError } from '@/tasks/errors/WorkerInitializationError';

describe('WorkerInitializationError', () => {
  it('should create an instance with correct properties', () => {
    const message = 'Failed to initialize worker';
    const originalError = new Error('Network error');
    
    const error = new WorkerInitializationError(message, originalError);
    
    expect(error).toBeInstanceOf(WorkerInitializationError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain(message);
    expect(error.name).toBe('WorkerInitializationError');
    expect(error.code).toBe('WORKER_INITIALIZATION_ERROR');
    expect(error.originalError).toBe(originalError);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should create an instance without originalError', () => {
    const message = 'Failed to initialize worker';
    
    const error = new WorkerInitializationError(message);
    
    expect(error).toBeInstanceOf(WorkerInitializationError);
    expect(error.message).toContain(message);
    expect(error.name).toBe('WorkerInitializationError');
    expect(error.code).toBe('WORKER_INITIALIZATION_ERROR');
    expect(error.originalError).toBeUndefined();
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should include original error in context', () => {
    const message = 'Failed to initialize worker';
    const originalError = new Error('Network error');
    
    const error = new WorkerInitializationError(message, originalError);
    
    const errorJson = error.toJSON();
    
    expect(errorJson.context.originalError).toBe(originalError);
  });

  it('should have correct error message format', () => {
    const message = 'Worker failed to start';
    const error = new WorkerInitializationError(message);
    
    expect(error.message).toContain('WorkerInitializationError:');
    expect(error.message).toContain(message);
  });

  it('should support toString method', () => {
    const message = 'Worker failed to initialize';
    const originalError = new Error('File not found');
    const error = new WorkerInitializationError(message, originalError);
    
    const errorString = error.toString();
    
    expect(errorString).toContain('[WorkerInitializationError]');
    expect(errorString).toContain('(WORKER_INITIALIZATION_ERROR)');
    expect(errorString).toContain(message);
    expect(errorString).toContain(JSON.stringify({ originalError }));
  });

  it('should support toJSON method', () => {
    const message = 'Worker failed to initialize';
    const originalError = new Error('File not found');
    const error = new WorkerInitializationError(message, originalError);
    
    const errorJson = error.toJSON();
    
    expect(errorJson.name).toBe('WorkerInitializationError');
    expect(errorJson.message).toContain(message);
    expect(errorJson.code).toBe('WORKER_INITIALIZATION_ERROR');
    expect(errorJson.originalError).toBe(originalError);
    expect(errorJson.timestamp).toBeDefined();
    expect(errorJson.stack).toBeDefined();
  });

  it('should maintain proper prototype chain', () => {
    const error = new WorkerInitializationError('Test message');
    
    expect(error).toBeInstanceOf(WorkerInitializationError);
    expect(error).toBeInstanceOf(Error);
    // 检查原型链
    expect(Object.getPrototypeOf(error)).toBe(WorkerInitializationError.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(require('@/error/BaseError').ErrorBase.prototype);
  });
});