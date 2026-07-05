import { flatten } from '@/utils/array/collection/flatten';

describe('flatten utility function', () => {
    it('should flatten array with default depth of 1', () => {
        const input = [1, [2, 3], 4];
        const result = flatten(input);
        expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should flatten array with specified depth', () => {
        const input = [1, [2, [3, 4]], 5];
        const result = flatten(input, 2);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should not flatten when depth is 0', () => {
        const input = [1, [2, [3, 4]], 5];
        const result = flatten(input, 0);
        expect(result).toEqual([1, [2, [3, 4]], 5]);
    });

    it('should flatten nested arrays with depth of 1', () => {
        const input = [1, [2, 3], [4, [5, 6]]];
        const result = flatten(input, 1);
        expect(result).toEqual([1, 2, 3, 4, [5, 6]]);
    });

    it('should flatten deeply nested arrays with depth of 2', () => {
        const input = [1, [2, [3, [4, 5]]]];
        const result = flatten(input, 2);
        expect(result).toEqual([1, 2, 3, [4, 5]]);
    });

    it('should handle empty arrays', () => {
        const input: any[] = [];
        const result = flatten(input);
        expect(result).toEqual([]);
    });

    it('should handle array with empty nested arrays', () => {
        const input = [1, [], [2, []], 3];
        const result = flatten(input);
        // 空数组也是元素，会被保留
        expect(result).toEqual([1, 2, [], 3]);
    });

    it('should handle completely flat array', () => {
        const input = [1, 2, 3, 4, 5];
        const result = flatten(input);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle completely nested array', () => {
        const input = [
            [[[1, 2]], [3, 4]],
            [5, 6],
        ];
        const result = flatten(input, 3);
        expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should work with mixed types', () => {
        const input: any[] = [1, ['a', [true, null]], undefined, [42]];
        const result = flatten(input, 2);
        expect(result).toEqual([1, 'a', true, null, undefined, 42]);
    });

    it('should work with objects in nested arrays', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const input = [obj1, [obj2, [{ id: 3 }]]];
        const result = flatten(input, 2);
        expect(result).toEqual([obj1, obj2, { id: 3 }]);
    });

    it('should handle string arrays', () => {
        const input = ['a', ['b', ['c', 'd']], 'e'];
        const result = flatten(input, 2);
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should handle negative depth (edge case)', () => {
        const input = [1, [2, [3, 4]], 5];
        const result = flatten(input, -1);
        // With negative depth, no flattening should occur
        expect(result).toEqual([1, [2, [3, 4]], 5]);
    });

    it('should handle depth greater than nesting level', () => {
        const input = [1, [2, [3, [4, 5]]]];
        const result = flatten(input, 10);
        // Should flatten completely regardless of depth > nesting level
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should work with sparse arrays', () => {
        const input = [1, [2, , , 3], 4]; // eslint-disable-line no-sparse-arrays
        const result = flatten(input);
        expect(result).toEqual([1, 2, undefined, undefined, 3, 4]);
    });
});
