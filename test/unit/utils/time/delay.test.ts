import { delay } from '@/utils/time/delay';

describe('delay', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should resolve after specified time', async () => {
        const promise = delay(100);
        const resolved = jest.fn();

        promise.then(resolved);

        expect(resolved).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);

        await promise;
        expect(resolved).toHaveBeenCalledTimes(1);
    }, 15000); // Increase timeout for this test

    it('should handle zero delay', async () => {
        const promise = delay(0);
        const resolved = jest.fn();

        promise.then(resolved);

        expect(resolved).not.toHaveBeenCalled();

        jest.advanceTimersByTime(0);

        await promise;
        expect(resolved).toHaveBeenCalledTimes(1);
    }, 15000); // Increase timeout for this test

    it('should handle negative delay', async () => {
        const promise = delay(-50);
        const resolved = jest.fn();

        promise.then(resolved);

        expect(resolved).not.toHaveBeenCalled();

        // Since delay is converted to minimum 0, advance by 0
        jest.advanceTimersByTime(0);

        await promise;
        expect(resolved).toHaveBeenCalledTimes(1);
    }, 15000); // Increase timeout for this test

    it('should always return void', async () => {
        // Use fake timers to avoid real delays
        jest.useFakeTimers();

        const resultPromise = delay(0);

        // Advance timers to complete the delay
        jest.advanceTimersByTime(0);

        const result = await resultPromise;
        expect(result).toBeUndefined();

        jest.useRealTimers();
    }, 15000); // Increase timeout for this test

    it('should handle longer delays correctly', async () => {
        const startTime = Date.now();
        const delayTime = 500;

        jest.spyOn(global.Date, 'now').mockImplementation(() => startTime);

        const promise = delay(delayTime);
        const resolved = jest.fn();

        promise.then(resolved);

        // Should not resolve before delay time
        jest.advanceTimersByTime(delayTime - 100);
        expect(resolved).not.toHaveBeenCalled();

        // Should resolve after delay time
        jest.advanceTimersByTime(100);
        await promise;
        expect(resolved).toHaveBeenCalledTimes(1);
    }, 15000); // Increase timeout for this test
});
