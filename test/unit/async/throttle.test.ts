import { throttle } from '../../../src/async';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('应该限制函数执行频率', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    // 在限制时间内多次调用
    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    // 等待超过限制时间
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该在时间间隔后允许再次执行', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(50);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1); // 仍在限制时间内

    jest.advanceTimersByTime(50); // 达到 100ms

    expect(fn).toHaveBeenCalledTimes(2); // 现在可以执行了
  });

  it('应该使用 setTimeout 确保在限制时间后执行', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // 在限制时间内调用，不会立即执行
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // 等待剩余时间，确保 setTimeout 执行
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该将参数传递给被包装的函数', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const throttledFn = throttle(fn, 100);

    throttledFn(1, 2);

    expect(fn).toHaveBeenCalledWith(1, 2);

    // 再次调用并等待时间间隔
    jest.advanceTimersByTime(100);
    throttledFn(3, 4);

    expect(fn).toHaveBeenLastCalledWith(3, 4);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该使用默认的等待时间', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn); // 不指定等待时间，使用默认值 0

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2); // 因为等待时间为 0，所以可以立即执行
  });

  it('应该正确处理时间计算', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    // 第一次调用
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // 模拟时间经过了 50ms
    jest.advanceTimersByTime(50);

    // 在间隔时间内调用，不应该立即执行
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1); // 仍在限制时间内

    // 再经过 60ms，超过了 100ms 间隔
    jest.advanceTimersByTime(60); // 现在总共经过了 110ms

    // 函数应该再次执行
    expect(fn).toHaveBeenCalledTimes(2); 
  });

  it('应该在间隔结束时执行函数', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    // 等待时间超过间隔
    jest.advanceTimersByTime(150);

    // 再次调用
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});