import { after } from '@/utils/time/after';

describe('after', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should execute callback after specified delay', () => {
        const callback = jest.fn();
        const delay = 100;

        const result = after(delay, callback);

        expect(result.isActive()).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(delay);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(result.isActive()).toBe(false);
    });

    it('should handle zero delay', () => {
        const callback = jest.fn();

        const result = after(0, callback);

        expect(result.isActive()).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(0);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(result.isActive()).toBe(false);
    });

    it('should handle negative delay', () => {
        const callback = jest.fn();

        const result = after(-10, callback);

        expect(result.isActive()).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        // Since delay is converted to minimum 0, we still need to advance timers
        jest.advanceTimersByTime(0);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(result.isActive()).toBe(false);
    });

    it('should allow cancellation', () => {
        const callback = jest.fn();
        const delay = 100;

        const result = after(delay, callback);

        expect(result.isActive()).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        result.cancel();

        expect(result.isActive()).toBe(false);
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(delay);

        expect(callback).not.toHaveBeenCalled();
    });

    it('should not execute callback multiple times', () => {
        const callback = jest.fn();
        const delay = 100;

        after(delay, callback);

        jest.advanceTimersByTime(delay);

        expect(callback).toHaveBeenCalledTimes(1);

        // Advancing time again should not trigger callback again
        jest.advanceTimersByTime(delay);

        expect(callback).toHaveBeenCalledTimes(1);
    });
});
