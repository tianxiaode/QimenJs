import { ComposableRegistrarError } from '../../../../src/kernel/errors/ComposableRegistrarError';
import { KernelErrorCode } from '../../../../src/kernel/errors/codes';
import { KernelError } from '../../../../src/kernel/errors/KernelError';

describe('ComposableRegistrarError', () => {
  describe('constructor', () => {
    it('should create an instance with the correct properties', () => {
      const message = 'Composable not found';
      const code = KernelErrorCode.COMPOSABLE_NOT_FOUND;
      const context = { composableName: 'testComposable' };

      const error = new ComposableRegistrarError(message, code, context);

      expect(error).toBeInstanceOf(ComposableRegistrarError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toEqual(context);
    });

    it('should create an instance with minimal parameters', () => {
      const message = 'Registration failed';
      const code = KernelErrorCode.CIRCULAR_DEPENDENCY;

      const error = new ComposableRegistrarError(message, code);

      expect(error).toBeInstanceOf(ComposableRegistrarError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toBeUndefined();
    });

    it('should maintain the correct prototype chain', () => {
      const error = new ComposableRegistrarError('Test', KernelErrorCode.COMPOSABLE_NOT_FOUND);

      expect(error).toBeInstanceOf(ComposableRegistrarError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('properties', () => {
    it('should have correct name property', () => {
      const error = new ComposableRegistrarError('Test', KernelErrorCode.COMPOSABLE_NOT_FOUND);

      expect(error.name).toBe('ComposableRegistrarError');
    });
  });
});