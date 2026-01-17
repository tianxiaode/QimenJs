import { KernelError } from '../../../../src/kernel/errors/KernelError';
import { KernelErrorCode } from '../../../../src/kernel/errors/codes';

describe('KernelError', () => {
  describe('constructor', () => {
    it('should create an instance with the correct properties', () => {
      const message = 'Test error message';
      const code = KernelErrorCode.STREAM_REQUEST_FAILED;
      const context = { test: 'data' };

      const error = new KernelError(message, code, context);

      expect(error).toBeInstanceOf(KernelError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toEqual(context);
    });

    it('should create an instance with minimal parameters', () => {
      const message = 'Simple error';
      const code = KernelErrorCode.CIRCULAR_DEPENDENCY;

      const error = new KernelError(message, code);

      expect(error).toBeInstanceOf(KernelError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toBeUndefined();
    });

    it('should maintain the correct prototype chain', () => {
      const error = new KernelError('Test', KernelErrorCode.INVALID_PAGE_SIZE);

      expect(error).toBeInstanceOf(KernelError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('properties', () => {
    it('should have correct name property', () => {
      const error = new KernelError('Test', KernelErrorCode.INVALID_PAGE_SIZE);

      expect(error.name).toBe('KernelError');
    });
  });
});