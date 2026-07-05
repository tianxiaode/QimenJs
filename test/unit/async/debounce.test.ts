import { debounce } from '@/async';

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('应该延迟函数的执行', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn();

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该在等待时间内重新开始计时', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100);

        debouncedFn();
        jest.advanceTimersByTime(50);

        debouncedFn(); // 重新开始计时
        jest.advanceTimersByTime(50);

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该立即执行函数（immediate 为 true）', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100, true);

        debouncedFn();

        expect(fn).toHaveBeenCalledTimes(1);

        // 等待防抖时间过去，确保不会再次执行
        jest.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该在 immediate 模式下防抖后续调用', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 100, true);

        debouncedFn(); // 立即执行
        expect(fn).toHaveBeenCalledTimes(1);

        // 在等待时间内多次调用
        debouncedFn();
        debouncedFn();
        jest.advanceTimersByTime(50);

        expect(fn).toHaveBeenCalledTimes(1);

        // 等待足够长的时间，应该再次执行
        jest.advanceTimersByTime(50);

        expect(fn).toHaveBeenCalledTimes(1);

        // 再次调用应该立即执行
        debouncedFn();
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('应该将参数传递给被包装的函数', () => {
        const fn = jest.fn((a: number, b: number) => a + b);
        const debouncedFn = debounce(fn, 100);

        debouncedFn(1, 2);

        jest.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledWith(1, 2);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该在非 immediate 模式下返回 undefined', () => {
        const fn = jest.fn(() => 'result');
        const debouncedFn = debounce(fn, 100, false);

        const result = debouncedFn();

        expect(result).toBeUndefined();

        jest.advanceTimersByTime(100);

        // 检查函数是否被调用了
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该使用默认的等待时间', () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn); // 不指定等待时间

        debouncedFn();

        // 因为默认 wait 是 0，所以函数应该立即执行（非 immediate 模式下）
        jest.advanceTimersByTime(0);

        expect(fn).toHaveBeenCalledTimes(1);
    });
});
