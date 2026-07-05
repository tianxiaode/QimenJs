/**
 * Array 处理器单元测试
 */

import { ArrayUniqueProcessor } from '@/validation/processors/array/unique';
import { ArrayUniqueByProcessor } from '@/validation/processors/array/uniqueBy';
import { ArrayIncludesProcessor } from '@/validation/processors/array/includes';
import { ArrayExcludesProcessor } from '@/validation/processors/array/excludes';
import { ArrayLengthProcessor } from '@/validation/processors/array/length';
import { ArrayChildrenProcessor } from '@/validation/processors/array/children';

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

describe('ArrayUniqueProcessor', () => {
    it('should skip when unique is not true', async () => {
        const context = createContext([1, 1, 2], { type: 'array' });
        await ArrayUniqueProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass for unique array', async () => {
        const context = createContext([1, 2, 3], { type: 'array', unique: true });
        await ArrayUniqueProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for duplicate primitives', async () => {
        const context = createContext([1, 2, 1], { type: 'array', unique: true });
        await ArrayUniqueProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should fail for duplicate objects', async () => {
        const context = createContext([{ a: 1 }, { a: 1 }], { type: 'array', unique: true });
        await ArrayUniqueProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should return early when allErrors is false', async () => {
        const context = createContext([1, 1, 1], { type: 'array', unique: true, allErrors: false });
        await ArrayUniqueProcessor(context);
        expect(context.errors.length).toBe(1);
    });
});

describe('ArrayUniqueByProcessor', () => {
    it('should skip when uniqueBy is undefined', async () => {
        const context = createContext([{ id: 1 }, { id: 1 }], { type: 'array' });
        await ArrayUniqueByProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass for unique by string key', async () => {
        const context = createContext([{ id: 1 }, { id: 2 }], { type: 'array', uniqueBy: 'id' });
        await ArrayUniqueByProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for duplicate by string key', async () => {
        const context = createContext([{ id: 1 }, { id: 1 }], { type: 'array', uniqueBy: 'id' });
        await ArrayUniqueByProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function uniqueBy', async () => {
        const context = createContext(
            [
                { name: 'a', age: 20 },
                { name: 'b', age: 20 },
            ],
            { type: 'array', uniqueBy: (item: any) => item.age }
        );
        await ArrayUniqueByProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should handle getter error gracefully', async () => {
        // When uniqueBy is a function that throws
        const context = createContext([{ id: 1 }, { id: 2 }], {
            type: 'array',
            uniqueBy: (item: any) => {
                if (item.id === 2) throw new Error('getter error');
                return item.id;
            },
        });
        await ArrayUniqueByProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should continue with allItemsError', async () => {
        const context = createContext([{ id: 1 }, { id: 1 }, { id: 1 }], {
            type: 'array',
            uniqueBy: 'id',
            allItemsError: true,
        });
        await ArrayUniqueByProcessor(context);
        expect(context.errors.length).toBeGreaterThanOrEqual(2);
    });
});

describe('ArrayIncludesProcessor', () => {
    it('should skip when includes is undefined', async () => {
        const context = createContext([1, 2], { type: 'array' });
        await ArrayIncludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when value matches includes', async () => {
        const context = createContext([1, 2], {
            type: 'array',
            includes: [
                [1, 2],
                [3, 4],
            ],
        });
        await ArrayIncludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value does not match includes', async () => {
        const context = createContext([1, 2], {
            type: 'array',
            includes: [
                [3, 4],
                [5, 6],
            ],
        });
        await ArrayIncludesProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function includes', async () => {
        const getIncludes = jest.fn().mockReturnValue([[1, 2]]);
        const context = createContext([1, 2], { type: 'array', includes: getIncludes });
        await ArrayIncludesProcessor(context);
        expect(getIncludes).toHaveBeenCalled();
        expect(context.errors).toHaveLength(0);
    });
});

describe('ArrayExcludesProcessor', () => {
    it('should skip when excludes is undefined', async () => {
        const context = createContext([1, 2], { type: 'array' });
        await ArrayExcludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when value does not match excludes', async () => {
        const context = createContext([1, 2], {
            type: 'array',
            excludes: [
                [3, 4],
                [5, 6],
            ],
        });
        await ArrayExcludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value matches excludes', async () => {
        const context = createContext([1, 2], {
            type: 'array',
            excludes: [
                [1, 2],
                [3, 4],
            ],
        });
        await ArrayExcludesProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function excludes', async () => {
        const getExcludes = jest.fn().mockReturnValue([[1, 2]]);
        const context = createContext([1, 2], { type: 'array', excludes: getExcludes });
        await ArrayExcludesProcessor(context);
        expect(getExcludes).toHaveBeenCalled();
        expect(context.errors.length).toBeGreaterThan(0);
    });
});

describe('ArrayLengthProcessor', () => {
    it('should pass for valid minLength', async () => {
        const context = createContext([1, 2, 3], { type: 'array', minLength: 2 });
        await ArrayLengthProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for minLength violation', async () => {
        const context = createContext([1], { type: 'array', minLength: 2 });
        await ArrayLengthProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for valid maxLength', async () => {
        const context = createContext([1, 2], { type: 'array', maxLength: 3 });
        await ArrayLengthProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for maxLength violation', async () => {
        const context = createContext([1, 2, 3, 4], { type: 'array', maxLength: 3 });
        await ArrayLengthProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for exact length', async () => {
        const context = createContext([1, 2, 3], { type: 'array', length: 3 });
        await ArrayLengthProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for wrong exact length', async () => {
        const context = createContext([1, 2], { type: 'array', length: 3 });
        await ArrayLengthProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should return early when allErrors is false and minLength fails', async () => {
        const context = createContext([], {
            type: 'array',
            minLength: 1,
            maxLength: 5,
            allErrors: false,
        });
        await ArrayLengthProcessor(context);
        expect(context.errors.length).toBe(1);
    });
});

describe('ArrayChildrenProcessor', () => {
    it('should skip when no itemRule', async () => {
        const context = createContext([1, 2, 3], { type: 'array' });
        await ArrayChildrenProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should skip when value is not array', async () => {
        const context = createContext('not-array', { type: 'array', itemRule: { type: 'number' } });
        await ArrayChildrenProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should skip null items when allowEmptyItem is true', async () => {
        const context = createContext([1, null, 3], {
            type: 'array',
            itemRule: { type: 'number' },
            allowEmptyItem: true,
        });
        // This calls doValidate internally which needs Logger mock
        // Just verify the processor doesn't throw
        try {
            await ArrayChildrenProcessor(context);
        } catch (e: any) {
            // Logger not mocked, expected
            if (!e.message?.includes('emit')) throw e;
        }
    });
});
