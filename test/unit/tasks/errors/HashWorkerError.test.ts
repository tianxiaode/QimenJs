import { HashWorkerError } from '@/tasks/errors/HashWorkerError';

describe('HashWorkerError', () => {
    it('should create an instance with correct properties', () => {
        const message = 'Test error message';
        const context = { some: 'context' };
        
        const error = new HashWorkerError(message, context);
        
        expect(error).toBeInstanceOf(HashWorkerError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('HashWorkerError: Test error message');
        expect(error.name).toBe('HashWorkerError');
        expect(error.context).toEqual(context);
        expect(error.code).toBe('HashWorkerError');
    });

    it('should create an instance with optional context', () => {
        const message = 'Test error message without context';
        
        const error = new HashWorkerError(message);
        
        expect(error).toBeInstanceOf(HashWorkerError);
        expect(error.message).toContain('HashWorkerError: Test error message without context');
        expect(error.name).toBe('HashWorkerError');
        expect(error.context).toBeUndefined();
        expect(error.code).toBe('HashWorkerError');
    });
});