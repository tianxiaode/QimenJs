import { debounce } from '@/utils/time/debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = jest.fn(x => x * 2);
    const debouncedFn = debounce(fn, 100);

    debouncedFn(2);
    debouncedFn(3); // This call should be cancelled
    debouncedFn(4); // This should be the actual call

    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(4);
  });

  it('should execute immediately when immediate is true', () => {
    const fn = jest.fn(x => x * 2);
    const debouncedFn = debounce(fn, 100, true);

    debouncedFn(2); // This should execute immediately
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);

    // Additional calls should be debounced
    debouncedFn(3);
    debouncedFn(4);
    expect(fn).toHaveBeenCalledTimes(1);

    // After waiting past debounce period, another call should execute
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    // Now call again, it should execute
    debouncedFn(5);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(5);
  });

  it('should handle zero wait time', () => {
    const fn = jest.fn(x => x * 2);
    const debouncedFn = debounce(fn, 0);

    debouncedFn(1);
    debouncedFn(2);
    debouncedFn(3);

    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('should handle negative wait time', () => {
    const fn = jest.fn(x => x * 2);
    const debouncedFn = debounce(fn, -50);

    debouncedFn(1);
    debouncedFn(2);

    expect(fn).not.toHaveBeenCalled();
    // Wait for minimum 0 time
    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
  });

  it('should return function result when immediate is true', () => {
    const fn = jest.fn(x => x * 2);
    const debouncedFn = debounce(fn, 100, true);

    const result = debouncedFn(5);

    expect(result).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(5);
  });

  it('should return undefined for non-immediate debounce', () => {
    const fn = jest.fn(x => x * 2);
    const debouncedFn = debounce(fn, 100);

    const result = debouncedFn(5);

    expect(result).toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
  });
});