import {
  HashWorkerMessage,
  HashWorkerResponse,
  HashWorkerInitMessage,
  HashWorkerUpdateMessage,
  HashWorkerFinalMessage,
  HashWorkerResetMessage,
  HashWorkerAck,
  HashWorkerDigest,
  HashWorkerError
} from '@/tasks/hash-task/worker/HashWorkerProtocol';
import { Chunk } from '@/tasks/hash-task/types/chunk';

describe('HashWorkerProtocol', () => {
  describe('HashWorkerInitMessage', () => {
    it('should have correct type and algorithm', () => {
      const message: HashWorkerInitMessage = {
        type: 'init',
        algorithm: 'sha256'
      };

      expect(message.type).toBe('init');
      expect(message.algorithm).toBe('sha256');
    });
  });

  describe('HashWorkerUpdateMessage', () => {
    it('should have correct type, chunkId and data', () => {
      const data = new ArrayBuffer(16);
      const message: HashWorkerUpdateMessage = {
        type: 'update',
        chunkId: 'chunk-1',
        data
      };

      expect(message.type).toBe('update');
      expect(message.chunkId).toBe('chunk-1');
      expect(message.data).toBe(data);
    });
  });

  describe('HashWorkerFinalMessage', () => {
    it('should have correct type', () => {
      const message: HashWorkerFinalMessage = {
        type: 'final'
      };

      expect(message.type).toBe('final');
    });
  });

  describe('HashWorkerResetMessage', () => {
    it('should have correct type', () => {
      const message: HashWorkerResetMessage = {
        type: 'reset'
      };

      expect(message.type).toBe('reset');
    });
  });

  describe('HashWorkerAck', () => {
    it('should have correct type and optional chunkId', () => {
      const ack: HashWorkerAck = {
        type: 'ack',
        chunkId: 'chunk-1'
      };

      expect(ack.type).toBe('ack');
      expect(ack.chunkId).toBe('chunk-1');
    });

    it('should work without chunkId', () => {
      const ack: HashWorkerAck = {
        type: 'ack'
      };

      expect(ack.type).toBe('ack');
      expect(ack.chunkId).toBeUndefined();
    });
  });

  describe('HashWorkerDigest', () => {
    it('should have correct type and result', () => {
      const result = new ArrayBuffer(32);
      const digest: HashWorkerDigest = {
        type: 'digest',
        result
      };

      expect(digest.type).toBe('digest');
      expect(digest.result).toBe(result);
    });
  });

  describe('HashWorkerError', () => {
    it('should have correct type, code and message', () => {
      const error: HashWorkerError = {
        type: 'error',
        code: 'TEST_ERROR',
        message: 'Test error message'
      };

      expect(error.type).toBe('error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
    });
  });

  describe('Union Types', () => {
    it('should allow all message types in HashWorkerMessage', () => {
      const initMessage: HashWorkerMessage = { type: 'init', algorithm: 'sha256' };
      const updateMessage: HashWorkerMessage = { type: 'update', chunkId: '1', data: new ArrayBuffer(16) };
      const finalMessage: HashWorkerMessage = { type: 'final' };
      const resetMessage: HashWorkerMessage = { type: 'reset' };

      expect(initMessage.type).toBe('init');
      expect(updateMessage.type).toBe('update');
      expect(finalMessage.type).toBe('final');
      expect(resetMessage.type).toBe('reset');
    });

    it('should allow all response types in HashWorkerResponse', () => {
      const ack: HashWorkerResponse = { type: 'ack', chunkId: '1' };
      const digest: HashWorkerResponse = { type: 'digest', result: new ArrayBuffer(32) };
      const error: HashWorkerResponse = { type: 'error', code: 'ERR', message: 'Error' };

      expect(ack.type).toBe('ack');
      expect(digest.type).toBe('digest');
      expect(error.type).toBe('error');
    });
  });
});