/**
 * after / repeat 工具函数单元测试
 *
 * 覆盖：
 * 1. after: 正常执行回调、取消、isActive
 * 2. repeat: 重复执行指定次数、取消
 */

jest.useFakeTimers();

import { after } from '@/utils/time/after';
import { repeat } from '@/utils/time/repeat';

describe('after', () => {
    it('延迟后应执行回调', () => {
        const callback = jest.fn();
        const cancelable = after(100, callback);

        jest.advanceTimersByTime(100);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(cancelable.isActive()).toBe(false);
    });

    it('取消后不应执行回调', () => {
        const callback = jest.fn();
        const cancelable = after(100, callback);

        cancelable.cancel();
        jest.advanceTimersByTime(100);

        expect(callback).not.toHaveBeenCalled();
        expect(cancelable.isActive()).toBe(false);
    });

    it('已执行后取消不应报错', () => {
        const callback = jest.fn();
        const cancelable = after(50, callback);

        jest.advanceTimersByTime(50);
        expect(callback).toHaveBeenCalledTimes(1);

        // 已执行后取消
        expect(() => cancelable.cancel()).not.toThrow();
    });

    it('初始状态 isActive 应为 true', () => {
        const cancelable = after(100, jest.fn());
        expect(cancelable.isActive()).toBe(true);
        cancelable.cancel();
    });

    it('delay 为 0 时也应正常执行', () => {
        const callback = jest.fn();
        const cancelable = after(0, callback);

        jest.advanceTimersByTime(0);

        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe('repeat', () => {
    it('应重复执行指定次数', () => {
        const fn = jest.fn();
        repeat(3, 100, fn);

        // 第 1 次
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);

        // 第 2 次
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(2);

        // 第 3 次
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(3);

        // 不应再执行
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('取消后不应继续执行', () => {
        const fn = jest.fn();
        const handle = repeat(5, 100, fn);

        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);

        handle.cancel();

        jest.advanceTimersByTime(200);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('已完成后取消不应报错', () => {
        const fn = jest.fn();
        const handle = repeat(1, 50, fn);

        jest.advanceTimersByTime(50);
        expect(fn).toHaveBeenCalledTimes(1);

        // 已完成后取消
        expect(() => handle.cancel()).not.toThrow();
    });
});
