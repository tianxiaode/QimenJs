/**
 * DebounceAbility 单元测试
 *
 * 覆盖：debounce
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { DebounceAbility } from '@/system-abilities/system/DebounceAbility';

function createHost() {
    class TestHost extends ComposableBase {}
    withAbilities(TestHost, [DebounceAbility]);
    return new TestHost() as any;
}

describe('DebounceAbility', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('debounce', () => {
        it('返回防抖函数', () => {
            const host = createHost();
            const fn = jest.fn();
            const debounced = host.debounce('save', fn, 100);
            expect(typeof debounced).toBe('function');
        });

        it('防抖函数延迟执行', () => {
            const host = createHost();
            const fn = jest.fn();
            const debounced = host.debounce('save', fn, 100);
            debounced();
            expect(fn).not.toHaveBeenCalled();
            jest.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('相同 key 返回同一防抖实例', () => {
            const host = createHost();
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            const d1 = host.debounce('save', fn1, 100);
            const d2 = host.debounce('save', fn2, 100);
            expect(d1).toBe(d2);
        });

        it('不同 key 返回不同防抖实例', () => {
            const host = createHost();
            const fn = jest.fn();
            const d1 = host.debounce('save', fn, 100);
            const d2 = host.debounce('load', fn, 100);
            expect(d1).not.toBe(d2);
        });

        it('防抖函数有 cancel 方法', () => {
            const host = createHost();
            const fn = jest.fn();
            const debounced = host.debounce('save', fn, 100);
            expect(typeof debounced.cancel).toBe('function');
        });

        it('cancel 取消待执行的调用', () => {
            const host = createHost();
            const fn = jest.fn();
            const debounced = host.debounce('save', fn, 100);
            debounced();
            debounced.cancel();
            jest.advanceTimersByTime(100);
            expect(fn).not.toHaveBeenCalled();
        });
    });
});
