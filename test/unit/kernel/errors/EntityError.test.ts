import { EntityError } from '../../../../src/kernel/errors/EntityError';
import { KernelErrorCode } from '../../../../src/kernel/errors/codes';
import { KernelError } from '../../../../src/kernel/errors/KernelError';

describe('EntityError', () => {
  describe('constructor', () => {
    it('should create an instance with the correct properties', () => {
      const message = 'Entity not found';
      const code = KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS;
      const context = { entityId: '123', operation: 'update' };

      const error = new EntityError(message, code, context);

      expect(error).toBeInstanceOf(EntityError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toEqual(context);
    });

    it('should create an instance with minimal parameters', () => {
      const message = 'Entity operation failed';
      const code = KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS;

      const error = new EntityError(message, code);

      expect(error).toBeInstanceOf(EntityError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toBeUndefined();
    });

    it('should maintain the correct prototype chain', () => {
      const error = new EntityError('Test', KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS);

      expect(error).toBeInstanceOf(EntityError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('properties', () => {
    it('should have correct name property', () => {
      const error = new EntityError('Test', KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS);

      expect(error.name).toBe('EntityError');
    });
  });
});