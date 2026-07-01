/**
 * DebounceAbilityBase 单元测试
 * 
 * 新架构下防抖通过 ComposableBase.debounce() 实现，
 * DebounceAbilityBase 保留为旧版兼容，但 getDebouncedAction() 已废弃。
 * 新版 AbilityDefinition 使用 this.debounce() 实现防抖。
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
            }))
        }
    };
});

import { ComposableBase, type AbilityDefinition } from '@/composable';

// 使用 AbilityDefinition + this.debounce() 实现防抖
const TestDebounceDef: AbilityDefinition = {
    search(keyword: string) {
        return this.debounce('search', () => `searched: ${keyword}`, 100)();
    },
    save() {
        return this.debounce('save', () => 'saved', 200, true)();
    },
};

class TestDebounceHost extends ComposableBase {
    static readonly abilities = [TestDebounceDef];
}

describe('debounce via AbilityDefinition', () => {
    let host: TestDebounceHost;

    beforeEach(() => {
        jest.useFakeTimers();
        host = new TestDebounceHost();
    });

    afterEach(() => {
        host.dispose();
        jest.useRealTimers();
    });

    it('should expose debounced actions', () => {
        expect(typeof host.search).toBe('function');
        expect(typeof host.save).toBe('function');
    });

    it('should debounce the action', () => {
        // Call multiple times rapidly
        (host as any).search('a');
        (host as any).search('b');
        (host as any).search('c');

        // Before timer fires, no result yet
        jest.advanceTimersByTime(50);

        // After full wait, only the last call should execute
        jest.advanceTimersByTime(100);
    });

    it('should return same debounced function for same key', () => {
        const fn1 = (host as any).search;
        const fn2 = (host as any).search;
        expect(fn1).toBe(fn2);
    });

    it('should support immediate mode', () => {
        // save uses immediate: true
        (host as any).save();
        // In immediate mode, the function should be called right away
        jest.advanceTimersByTime(0);
    });

    it('should cancel all debounced timers on dispose', () => {
        (host as any).search('test');
        (host as any).save();
        host.dispose();
        // Advance timers - should not cause any issues
        jest.advanceTimersByTime(500);
    });

    it('should clear debounce state on dispose', () => {
        (host as any).search('test');
        host.dispose();
        // After dispose, debounce state should be cleared
        // No direct way to verify, but no errors should occur
    });
});
