import { AlgorithmNotSupportedError } from '@/tasks/errors/AlgorithmNotSupportedError';

describe('AlgorithmNotSupportedError', () => {
  it('should create an instance with correct properties', () => {
    const algorithm = 'SHA-3';
    const error = new AlgorithmNotSupportedError(algorithm, algorithm);
    
    expect(error).toBeInstanceOf(AlgorithmNotSupportedError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain(algorithm);
    expect(error.name).toBe('AlgorithmNotSupportedError');
    expect(error.code).toBe('ALGORITHM_NOT_SUPPORTED');
    expect(error.algorithmName).toBe(algorithm);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should include algorithm in context', () => {
    const algorithm = 'MD5';
    const error = new AlgorithmNotSupportedError(algorithm, algorithm);
    
    const errorJson = error.toJSON();
    
    expect(errorJson.context.algorithm).toBe(algorithm);
    expect(errorJson.context.algorithmName).toBe(algorithm);
  });

  it('should have correct error message format', () => {
    const algorithm = 'SHA-512';
    const error = new AlgorithmNotSupportedError(algorithm, algorithm);
    
    expect(error.message).toContain('AlgorithmNotSupportedError:');
    expect(error.message).toContain(algorithm);
    expect(error.message).toContain('is not supported in this environment');
  });

  it('should support toString method', () => {
    const algorithm = 'SHA-1';
    const error = new AlgorithmNotSupportedError(algorithm, algorithm);
    
    const errorString = error.toString();
    
    expect(errorString).toContain('[AlgorithmNotSupportedError]');
    expect(errorString).toContain('(ALGORITHM_NOT_SUPPORTED)');
    expect(errorString).toContain(algorithm);
    expect(errorString).toContain('is not supported in this environment');
  });

  it('should support toJSON method', () => {
    const algorithm = 'SHA-256';
    const error = new AlgorithmNotSupportedError(algorithm, algorithm);
    
    const errorJson = error.toJSON();
    
    expect(errorJson.name).toBe('AlgorithmNotSupportedError');
    expect(errorJson.message).toContain(algorithm);
    expect(errorJson.code).toBe('ALGORITHM_NOT_SUPPORTED');
    // algorithmName 是一个公共属性，但不会直接在 JSON 输出中，它在 context 中
    expect(errorJson.context.algorithmName).toBe(algorithm);
    expect(errorJson.timestamp).toBeDefined();
    expect(errorJson.stack).toBeDefined();
  });

  it('should maintain proper prototype chain', () => {
    const error = new AlgorithmNotSupportedError('SHA-3', 'SHA-3');
    
    expect(error).toBeInstanceOf(AlgorithmNotSupportedError);
    expect(error).toBeInstanceOf(Error);
    // 检查原型链
    expect(Object.getPrototypeOf(error)).toBe(AlgorithmNotSupportedError.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(require('@/error/BaseError').ErrorBase.prototype);
  });
});