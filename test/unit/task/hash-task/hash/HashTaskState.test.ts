import { HashTaskState } from '@/task/hash-task/hash/HashTaskState';
import { TaskStateError } from '@/task/hash-task/errors';

describe('HashTaskState', () => {
    let state: HashTaskState;

    beforeEach(() => {
        state = new HashTaskState();
    });

    describe('initial state', () => {
        it('should initialize with idle status', () => {
            expect(state.value).toBe('idle');
        });
    });

    describe('canStart', () => {
        it('should return true when status is idle', () => {
            expect(state.canStart()).toBe(true);
        });

        it('should return false when status is not idle', () => {
            state['status'] = 'running';
            expect(state.canStart()).toBe(false);
        });
    });

    describe('canPause', () => {
        it('should return true when status is running', () => {
            state['status'] = 'running';
            expect(state.canPause()).toBe(true);
        });

        it('should return false when status is not running', () => {
            expect(state.canPause()).toBe(false);
        });
    });

    describe('canResume', () => {
        it('should return true when status is paused', () => {
            state['status'] = 'paused';
            expect(state.canResume()).toBe(true);
        });

        it('should return false when status is not paused', () => {
            expect(state.canResume()).toBe(false);
        });
    });

    describe('canCancel', () => {
        it('should return true when status is running', () => {
            state['status'] = 'running';
            expect(state.canCancel()).toBe(true);
        });

        it('should return true when status is paused', () => {
            state['status'] = 'paused';
            expect(state.canCancel()).toBe(true);
        });

        it('should return false when status is idle', () => {
            expect(state.canCancel()).toBe(false);
        });
    });

    describe('isFinished', () => {
        it('should return true when status is completed', () => {
            state['status'] = 'completed';
            expect(state.isFinished()).toBe(true);
        });

        it('should return true when status is failed', () => {
            state['status'] = 'failed';
            expect(state.isFinished()).toBe(true);
        });

        it('should return true when status is cancelled', () => {
            state['status'] = 'cancelled';
            expect(state.isFinished()).toBe(true);
        });

        it('should return false when status is not finished', () => {
            expect(state.isFinished()).toBe(false);
        });
    });

    describe('isCancelled', () => {
        it('should return true when status is cancelled', () => {
            state['status'] = 'cancelled';
            expect(state.isCancelled()).toBe(true);
        });

        it('should return false when status is not cancelled', () => {
            expect(state.isCancelled()).toBe(false);
        });
    });

    describe('start', () => {
        it('should change status to running and set startedAt when current status is idle', () => {
            const before = Date.now();
            state.start();
            const after = Date.now();

            expect(state.value).toBe('running');
            const snapshot = state.snapshot();
            expect(snapshot.startedAt).toBeGreaterThanOrEqual(before);
            expect(snapshot.startedAt).toBeLessThanOrEqual(after);
        });

        it('should throw TaskStateError when trying to start from non-idle state', () => {
            state['status'] = 'running';
            expect(() => state.start()).toThrow(TaskStateError);
        });
    });

    describe('pause', () => {
        it('should change status to paused and set pausedAt when current status is running', () => {
            state['status'] = 'running';
            const before = Date.now();
            state.pause();
            const after = Date.now();

            expect(state.value).toBe('paused');
            const snapshot = state.snapshot();
            expect(snapshot.pausedAt).toBeGreaterThanOrEqual(before);
            expect(snapshot.pausedAt).toBeLessThanOrEqual(after);
        });

        it('should throw TaskStateError when trying to pause from non-running state', () => {
            expect(() => state.pause()).toThrow(TaskStateError);
        });
    });

    describe('resume', () => {
        it('should change status to running and clear pausedAt when current status is paused', () => {
            state['status'] = 'paused';
            state['pausedAt'] = Date.now();
            state.resume();

            expect(state.value).toBe('running');
            const snapshot = state.snapshot();
            expect(snapshot.pausedAt).toBeUndefined();
        });

        it('should throw TaskStateError when trying to resume from non-paused state', () => {
            expect(() => state.resume()).toThrow(TaskStateError);
        });
    });

    describe('complete', () => {
        it('should change status to completed and set finishedAt when current status is running', () => {
            state['status'] = 'running';
            const before = Date.now();
            state.complete();
            const after = Date.now();

            expect(state.value).toBe('completed');
            const snapshot = state.snapshot();
            expect(snapshot.finishedAt).toBeGreaterThanOrEqual(before);
            expect(snapshot.finishedAt).toBeLessThanOrEqual(after);
        });

        it('should throw TaskStateError when trying to complete from non-running state', () => {
            expect(() => state.complete()).toThrow(TaskStateError);
        });
    });

    describe('fail', () => {
        it('should change status to failed and set finishedAt when current status is not finished', () => {
            state['status'] = 'running';
            const before = Date.now();
            const error = new Error('Test error');
            state.fail(error);
            const after = Date.now();

            expect(state.value).toBe('failed');
            const snapshot = state.snapshot();
            expect(snapshot.finishedAt).toBeGreaterThanOrEqual(before);
            expect(snapshot.finishedAt).toBeLessThanOrEqual(after);
        });

        it('should throw TaskStateError when trying to fail from finished state', () => {
            state['status'] = 'completed';
            const error = new Error('Test error');
            expect(() => state.fail(error)).toThrow(TaskStateError);
        });
    });

    describe('cancel', () => {
        it('should change status to cancelled and set finishedAt when current status is running', () => {
            state['status'] = 'running';
            const before = Date.now();
            state.cancel();
            const after = Date.now();

            expect(state.value).toBe('cancelled');
            const snapshot = state.snapshot();
            expect(snapshot.finishedAt).toBeGreaterThanOrEqual(before);
            expect(snapshot.finishedAt).toBeLessThanOrEqual(after);
        });

        it('should change status to cancelled and set finishedAt when current status is paused', () => {
            state['status'] = 'paused';
            const before = Date.now();
            state.cancel();
            const after = Date.now();

            expect(state.value).toBe('cancelled');
            const snapshot = state.snapshot();
            expect(snapshot.finishedAt).toBeGreaterThanOrEqual(before);
            expect(snapshot.finishedAt).toBeLessThanOrEqual(after);
        });

        it('should throw TaskStateError when trying to cancel from invalid state', () => {
            expect(() => state.cancel()).toThrow(TaskStateError);
        });
    });

    describe('snapshot', () => {
        it('should return correct snapshot values', () => {
            state['status'] = 'running';
            state['startedAt'] = 1000;
            state['finishedAt'] = 2000;
            state['pausedAt'] = 1500;

            const snapshot = state.snapshot();
            expect(snapshot).toEqual({
                status: 'running',
                startedAt: 1000,
                finishedAt: 2000,
                pausedAt: 1500
            });
        });
    });

    describe('updateStatus', () => {
        it('should start the task when new status is running and can start', () => {
            state.updateStatus('running');
            expect(state.value).toBe('running');
        });

        it('should cancel the task when new status is cancelled and can cancel', () => {
            state['status'] = 'running';
            state.updateStatus('cancelled');
            expect(state.value).toBe('cancelled');
        });

        it('should not update status if transition is not allowed', () => {
            // This would be a no-op since we don't handle 'completed' in updateStatus
            state.updateStatus('completed');
            expect(state.value).toBe('idle');
        });
    });
});