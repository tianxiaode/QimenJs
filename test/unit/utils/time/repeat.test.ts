import { repeat } from '@/utils/time/repeat';

describe('repeat', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should execute callback specified number of times at specified intervals', () => {
        const callback = jest.fn();
        const times = 3;
        const interval = 100;

        const result = repeat(times, interval, callback);

        // Initially, no calls should have occurred
        expect(callback).not.toHaveBeenCalled();

        // After first interval, one call
        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(1);

        // After second interval, two calls
        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(2);

        // After third interval, three calls (should stop after this)
        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(3);

        // After more time, still only three calls (should have stopped)
        jest.advanceTimersByTime(interval * 2);
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should allow cancellation before completion', () => {
        const callback = jest.fn();
        const times = 5;
        const interval = 100;

        const result = repeat(times, interval, callback);

        // Execute twice
        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(2);

        // Cancel
        result.cancel();

        // Further time advances should not trigger callback
        jest.advanceTimersByTime(interval * 3);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should execute once with interval of 0', () => {
        const callback = jest.fn();
        const times = 1;
        const interval = 0;

        const result = repeat(times, interval, callback);

        expect(callback).not.toHaveBeenCalled();

        // Execute immediately
        jest.advanceTimersByTime(0);
        expect(callback).toHaveBeenCalledTimes(1);

        // Should not execute again
        jest.advanceTimersByTime(0);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle times = 1 correctly', () => {
        const callback = jest.fn();
        const times = 1;
        const interval = 100;

        repeat(times, interval, callback);

        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(1);

        // Should not execute again after completion
        jest.advanceTimersByTime(interval);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not start after cancellation immediately', () => {
        const callback = jest.fn();
        const times = 3;
        const interval = 100;

        const result = repeat(times, interval, callback);
        result.cancel();

        // Should not execute after cancellation
        jest.advanceTimersByTime(interval * 3);
        expect(callback).not.toHaveBeenCalled();
    });
});
