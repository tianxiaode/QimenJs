import { throttle } from '@/utils/time/throttle';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock Date.now to control time in tests
    const originalNow = Date.now;
    jest.spyOn(global.Date, 'now').mockImplementation(() => originalNow());
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should execute function immediately on first call', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not execute function again within the wait time', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn(); // Execute immediately
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn(); // Should be throttled
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn(); // Should be throttled
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time but not enough to allow next execution
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should execute function again after wait time', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn(); // Execute immediately
    expect(fn).toHaveBeenCalledTimes(1);

    // Call multiple times while throttled
    throttledFn();
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time past throttle interval
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2); // The function should execute again now
  });

  it('should work with arguments', () => {
    const fn = jest.fn((a: number, b: string) => a + b.length);
    const throttledFn = throttle(fn, 100);

    throttledFn(5, 'hello');

    expect(fn).toHaveBeenCalledWith(5, 'hello');
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn(10, 'world');
    expect(fn).toHaveBeenCalledTimes(1); // Still only 1 due to throttling
  });

  it('should handle zero wait time', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 0);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(3); // All should execute with 0 wait time
  });

  it('should handle negative wait time', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, -50);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(3); // All should execute with negative wait time
  });

  it('should properly throttle after the throttled period', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn(); // Execute immediately
    expect(fn).toHaveBeenCalledTimes(1);

    // Multiple calls during throttle period
    throttledFn();
    throttledFn();
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // After throttle period, the next call should execute
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);

    throttledFn(); // Should execute now
    expect(fn).toHaveBeenCalledTimes(2); // Still 2 because it was throttled

    // Advance time to allow next execution
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(3); // Now it should execute

    // More calls should be throttled again
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should clear existing timer when called again before timeout', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn(); // Execute immediately
    expect(fn).toHaveBeenCalledTimes(1);

    // Call again before timeout - this should set a timer
    throttledFn(); 
    expect(fn).toHaveBeenCalledTimes(1);

    // Call again before timeout - this should not create a new timer since one already exists
    throttledFn(); 
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time to 50% through the wait period
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);

    // Call again - this should not create a new timer
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // Now advance to the end of the window - should execute
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});