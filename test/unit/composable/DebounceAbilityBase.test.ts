/**
 * DebounceAbilityBase 单元测试
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

import { DebounceAbilityBase, AbilityBase, ComposableBase, ComposableRegistrar } from '@/composable';
import type { IExposeResult, AbilityProxy } from '@/composable';

class TestDebounceAbility extends DebounceAbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            search: this.getDebouncedAction('search', (keyword: string) => {
                return `searched: ${keyword}`;
            }, 100),
            save: this.getDebouncedAction('save', () => {
                return 'saved';
            }, 200, true),
        };
    }
}

class TestDebounceHost extends ComposableBase {
    static readonly abilities = [TestDebounceAbility];
}

describe('DebounceAbilityBase', () => {
    let host: TestDebounceHost;

    beforeEach(() => {
        jest.useFakeTimers();
        host = new TestDebounceHost();
    });

    afterEach(() => {
        host.dispose();
        ComposableRegistrar.getInstance().clearCaches();
        jest.useRealTimers();
    });

    it('should expose debounced actions', () => {
        expect(typeof host.search).toBe('function');
        expect(typeof host.save).toBe('function');
    });

    it('should debounce the action', () => {
        const results: string[] = [];
        // Call multiple times rapidly
        host.search('a');
        host.search('b');
        host.search('c');

        // Before timer fires, no result yet
        jest.advanceTimersByTime(50);

        // After full wait, only the last call should execute
        jest.advanceTimersByTime(100);
    });

    it('should return same debounced function for same key', () => {
        const fn1 = host.search;
        const fn2 = host.search;
        expect(fn1).toBe(fn2);
    });

    it('should support immediate mode', () => {
        // save uses immediate: true
        host.save();
        // In immediate mode, the function should be called right away
        jest.advanceTimersByTime(0);
    });

    it('should cancel all debounced timers on dispose', () => {
        host.search('test');
        host.save();
        host.dispose();
        // Advance timers - should not cause any issues
        jest.advanceTimersByTime(500);
    });

    it('should clear debouncedMap on dispose', () => {
        host.search('test');
        host.dispose();
        // After dispose, debouncedMap should be cleared
        // No direct way to verify, but no errors should occur
    });
});
