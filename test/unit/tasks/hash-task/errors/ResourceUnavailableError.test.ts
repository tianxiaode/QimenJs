import { ResourceUnavailableError } from '../../../../../src/tasks/hash-task/errors/ResourceUnavailableError';

describe('ResourceUnavailableError', () => {
  it('should create an instance with memory resource type', () => {
    const error = new ResourceUnavailableError('memory');
    
    expect(error).toBeInstanceOf(ResourceUnavailableError);
    expect(error.message).toBe('memory unavailable');
    expect(error.name).toBe('ResourceUnavailableError');
    expect(error.code).toBe('RESOURCE_UNAVAILABLE');
    expect(error.context).toEqual({ resource: 'memory' });
  });

  it('should create an instance with worker resource type', () => {
    const error = new ResourceUnavailableError('worker');
    
    expect(error).toBeInstanceOf(ResourceUnavailableError);
    expect(error.message).toBe('worker unavailable');
    expect(error.name).toBe('ResourceUnavailableError');
    expect(error.code).toBe('RESOURCE_UNAVAILABLE');
    expect(error.context).toEqual({ resource: 'worker' });
  });

  it('should create an instance with all resource type', () => {
    const error = new ResourceUnavailableError('all');
    
    expect(error).toBeInstanceOf(ResourceUnavailableError);
    expect(error.message).toBe('all unavailable');
    expect(error.name).toBe('ResourceUnavailableError');
    expect(error.code).toBe('RESOURCE_UNAVAILABLE');
    expect(error.context).toEqual({ resource: 'all' });
  });

  it('should create an instance with context information', () => {
    const context = { timestamp: Date.now(), additional: 'info' };
    const error = new ResourceUnavailableError('memory', context);
    
    expect(error).toBeInstanceOf(ResourceUnavailableError);
    expect(error.message).toBe('memory unavailable');
    expect(error.name).toBe('ResourceUnavailableError');
    expect(error.code).toBe('RESOURCE_UNAVAILABLE');
    expect(error.context).toEqual({ resource: 'memory', ...context });
  });
});