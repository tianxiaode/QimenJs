import { TaskStateError } from '../../../../../src/task/hash-task/errors/TaskStateError';

describe('TaskStateError', () => {
    it('should create an instance with a message', () => {
        const errorMessage = 'Invalid operation for current task state';
        const error = new TaskStateError(errorMessage);

        expect(error).toBeInstanceOf(TaskStateError);
        expect(error.message).toBe(errorMessage);
        expect(error.name).toBe('TaskStateError');
        expect(error.code).toBe('TASK_STATE_ERROR');
        expect(error.context).toBeUndefined();
    });

    it('should create an instance with a message and context information', () => {
        const errorMessage = 'Cannot cancel a completed task';
        const context = { taskId: '123', currentState: 'completed', attemptedAction: 'cancel' };
        const error = new TaskStateError(errorMessage, context);

        expect(error).toBeInstanceOf(TaskStateError);
        expect(error.message).toBe(errorMessage);
        expect(error.name).toBe('TaskStateError');
        expect(error.code).toBe('TASK_STATE_ERROR');
        expect(error.context).toEqual(context);
    });

    it('should handle empty string message', () => {
        const error = new TaskStateError('');

        expect(error).toBeInstanceOf(TaskStateError);
        expect(error.message).toBe('');
        expect(error.name).toBe('TaskStateError');
        expect(error.code).toBe('TASK_STATE_ERROR');
    });
});
