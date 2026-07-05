import { chunk } from '@/utils/array/collection/chunk';

describe('chunk utility function', () => {
    it('should chunk array into specified size', () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const size = 3;
        const result = chunk(input, size);
        expect(result).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ]);
    });

    it('should handle array with size larger than array length', () => {
        const input = [1, 2, 3];
        const size = 5;
        const result = chunk(input, size);
        expect(result).toEqual([[1, 2, 3]]);
    });

    it('should handle empty array', () => {
        const input: number[] = [];
        const size = 3;
        const result = chunk(input, size);
        expect(result).toEqual([]);
    });

    it('should handle size of 1', () => {
        const input = ['a', 'b', 'c', 'd'];
        const size = 1;
        const result = chunk(input, size);
        expect(result).toEqual([['a'], ['b'], ['c'], ['d']]);
    });

    it('should handle size of 0 (edge case)', () => {
        const input = [1, 2, 3, 4, 5];
        const size = 0;
        const result = chunk(input, size);
        // When size is 0, slice(i, i+0) returns empty arrays, so result is empty
        expect(result).toEqual([]);
    });

    it('should handle negative size (edge case)', () => {
        const input = [1, 2, 3, 4, 5];
        const size = -2;
        const result = chunk(input, size);
        // When size is negative, the loop condition is never satisfied
        expect(result).toEqual([]);
    });

    it('should handle size of 2 with odd length array', () => {
        const input = [1, 2, 3, 4, 5];
        const size = 2;
        const result = chunk(input, size);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle size of 4 with 7 elements', () => {
        const input = [1, 2, 3, 4, 5, 6, 7];
        const size = 4;
        const result = chunk(input, size);
        expect(result).toEqual([
            [1, 2, 3, 4],
            [5, 6, 7],
        ]);
    });

    it('should work with string arrays', () => {
        const input = ['hello', 'world', 'foo', 'bar', 'baz'];
        const size = 2;
        const result = chunk(input, size);
        expect(result).toEqual([['hello', 'world'], ['foo', 'bar'], ['baz']]);
    });

    it('should work with mixed type arrays', () => {
        const input: any[] = [1, 'hello', true, null, undefined, { id: 1 }, [1, 2, 3]];
        const size = 3;
        const result = chunk(input, size);
        expect(result).toEqual([[1, 'hello', true], [null, undefined, { id: 1 }], [[1, 2, 3]]]);
    });

    it('should work with object arrays', () => {
        const obj1 = { id: 1, name: 'John' };
        const obj2 = { id: 2, name: 'Jane' };
        const obj3 = { id: 3, name: 'Bob' };
        const obj4 = { id: 4, name: 'Alice' };
        const input = [obj1, obj2, obj3, obj4];
        const size = 2;
        const result = chunk(input, size);
        expect(result).toEqual([
            [obj1, obj2],
            [obj3, obj4],
        ]);
    });

    it('should return correct chunks when size equals array length', () => {
        const input = [1, 2, 3, 4];
        const size = 4;
        const result = chunk(input, size);
        expect(result).toEqual([[1, 2, 3, 4]]);
    });

    it('should handle array with one element', () => {
        const input = [42];
        const size = 2;
        const result = chunk(input, size);
        expect(result).toEqual([[42]]);
    });
});
