/**
 * Number 处理器单元测试
 */

import { NumberTypeProcessor } from '@/validation/processors/number/type';
import { NumberIsProcessor } from '@/validation/processors/number/is';
import { NumberIncludesProcessor } from '@/validation/processors/number/includes';
import { NumberExcludesProcessor } from '@/validation/processors/number/excludes';

function createContext(value: any, rule: any = {}) {
    return {
        value,
        rule,
        errors: [] as any[],
        terminate: false,
        path: '',
        status: { isUndefined: value === undefined, isNull: value === null, isEmpty: false },
    } as any;
}

describe('NumberTypeProcessor', () => {
    it('should pass for valid number', async () => {
        const context = createContext(42, { type: 'number' });
        await NumberTypeProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for non-number', async () => {
        const context = createContext('42', { type: 'number' });
        await NumberTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should fail for NaN', async () => {
        const context = createContext(NaN, { type: 'number' });
        await NumberTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should fail for Infinity when infinite not allowed', async () => {
        const context = createContext(Infinity, { type: 'number' });
        await NumberTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should pass for Infinity when rule.infinite=true', async () => {
        const context = createContext(Infinity, { type: 'number', infinite: true });
        await NumberTypeProcessor(context);
        expect(context.errors).toHaveLength(0);
        expect(context.terminate).toBe(true); // Still terminates because it's infinite
    });

    it('should fail for -Infinity', async () => {
        const context = createContext(-Infinity, { type: 'number' });
        await NumberTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });
});

describe('NumberIsProcessor', () => {
    it('should pass for integer when rule.integer=true', async () => {
        const context = createContext(5, { type: 'number', integer: true });
        await NumberIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for non-integer when rule.integer=true', async () => {
        const context = createContext(5.5, { type: 'number', integer: true });
        await NumberIsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for positive when rule.positive=true', async () => {
        const context = createContext(5, { type: 'number', positive: true });
        await NumberIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for non-positive when rule.positive=true', async () => {
        const context = createContext(-5, { type: 'number', positive: true });
        await NumberIsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for negative when rule.negative=true', async () => {
        const context = createContext(-5, { type: 'number', negative: true });
        await NumberIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass for even when rule.even=true', async () => {
        const context = createContext(4, { type: 'number', even: true });
        await NumberIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for odd when rule.even=true', async () => {
        const context = createContext(3, { type: 'number', even: true });
        await NumberIsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for odd when rule.odd=true', async () => {
        const context = createContext(3, { type: 'number', odd: true });
        await NumberIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should skip when rule key is not true', async () => {
        const context = createContext(5, { type: 'number', integer: false });
        await NumberIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });
});

describe('NumberIncludesProcessor', () => {
    it('should skip when includes is undefined', async () => {
        const context = createContext(5, { type: 'number' });
        await NumberIncludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when value is in includes array', async () => {
        const context = createContext(5, { type: 'number', includes: [1, 3, 5, 7] });
        await NumberIncludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value is not in includes array', async () => {
        const context = createContext(2, { type: 'number', includes: [1, 3, 5, 7] });
        await NumberIncludesProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function includes', async () => {
        const getIncludes = jest.fn().mockReturnValue([1, 3, 5]);
        const context = createContext(3, { type: 'number', includes: getIncludes });
        await NumberIncludesProcessor(context);
        expect(getIncludes).toHaveBeenCalled();
        expect(context.errors).toHaveLength(0);
    });
});

describe('NumberExcludesProcessor', () => {
    it('should skip when excludes is undefined', async () => {
        const context = createContext(5, { type: 'number' });
        await NumberExcludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when value is not in excludes array', async () => {
        const context = createContext(2, { type: 'number', excludes: [1, 3, 5, 7] });
        await NumberExcludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value is in excludes array', async () => {
        const context = createContext(5, { type: 'number', excludes: [1, 3, 5, 7] });
        await NumberExcludesProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function excludes', async () => {
        const getExcludes = jest.fn().mockReturnValue([1, 3, 5]);
        const context = createContext(5, { type: 'number', excludes: getExcludes });
        await NumberExcludesProcessor(context);
        expect(getExcludes).toHaveBeenCalled();
        expect(context.errors.length).toBeGreaterThan(0);
    });
});
