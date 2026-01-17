import { StreamError } from '../../../../src/kernel/errors/StreamError';
import { KernelErrorCode } from '../../../../src/kernel/errors/codes';
import { KernelError } from '../../../../src/kernel/errors/KernelError';

describe('StreamError', () => {
  describe('constructor', () => {
    it('should create an instance with the correct properties', () => {
      const message = 'Stream request failed';
      const code = KernelErrorCode.STREAM_REQUEST_FAILED;
      const context = { url: 'https://api.example.com', method: 'GET' };

      const error = new StreamError(message, code, context);

      expect(error).toBeInstanceOf(StreamError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toEqual(context);
    });

    it('should create an instance with minimal parameters', () => {
      const message = 'Stream error occurred';
      const code = KernelErrorCode.STREAM_REQUEST_FAILED;

      const error = new StreamError(message, code);

      expect(error).toBeInstanceOf(StreamError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toBeUndefined();
    });

    it('should maintain the correct prototype chain', () => {
      const error = new StreamError('Test', KernelErrorCode.STREAM_REQUEST_FAILED);

      expect(error).toBeInstanceOf(StreamError);
      expect(error).toBeInstanceOf(KernelError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('properties', () => {
    it('should have correct name property', () => {
      const error = new StreamError('Test', KernelErrorCode.STREAM_REQUEST_FAILED);

      expect(error.name).toBe('StreamError');
    });
  });
});