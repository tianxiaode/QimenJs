import { GestureError } from '../../../../src/kernel/errors/GestureError';
import { KernelErrorCode } from '../../../../src/kernel/errors/codes';
import { KernelError } from '../../../../src/kernel/errors/KernelError';

describe('GestureError', () => {
  describe('constructor', () => {
    it('should create an instance with the correct properties', () => {
      const message = 'Gesture recognition failed';
      const code = KernelErrorCode.GESTURE_RECOGNITION_ERROR;
      const context = { 
        gestureType: 'swipe',
        startPosition: { x: 10, y: 20 },
        endPosition: { x: 50, y: 60 }
      };

      const error = new GestureError(message, code, context);

      expect(error).toBeInstanceOf(GestureError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toEqual(context);
    });

    it('should create an instance with minimal parameters', () => {
      const message = 'Insufficient gesture distance';
      const code = KernelErrorCode.GESTURE_DISTANCE_INSUFFICIENT;

      const error = new GestureError(message, code);

      expect(error).toBeInstanceOf(GestureError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toBeUndefined();
    });

    it('should maintain the correct prototype chain', () => {
      const error = new GestureError('Test', KernelErrorCode.GESTURE_RECOGNITION_ERROR);

      expect(error).toBeInstanceOf(GestureError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('properties', () => {
    it('should have correct name property', () => {
      const error = new GestureError('Test', KernelErrorCode.GESTURE_RECOGNITION_ERROR);

      expect(error.name).toBe('GestureError');
    });
  });
});