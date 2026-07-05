import { ResourceNotAcquiredError } from '../../../../../src/task/hash-task/errors/ResourceNotAcquiredError';

describe('ResourceNotAcquiredError', () => {
    it('should create an instance with correct message and name', () => {
        const error = new ResourceNotAcquiredError();

        expect(error).toBeInstanceOf(ResourceNotAcquiredError);
        expect(error.message).toBe('Attempted to access resources before acquisition');
        expect(error.name).toBe('ResourceNotAcquiredError');
        expect(error.code).toBe('RESOURCE_NOT_ACQUIRED');
    });
});
