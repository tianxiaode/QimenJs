import { removeValues, splitArray } from '@/utils/array/base/transform';

describe('transform utility functions', () => {
    describe('removeValues', () => {
        it('should remove specified values from the array', () => {
            const input = [1, 2, 3, 4, 5];
            const valuesToRemove = [2, 4];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([1, 3, 5]);
        });

        it('should handle array with no values to remove', () => {
            const input = [1, 2, 3, 4, 5];
            const valuesToRemove: number[] = [];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([1, 2, 3, 4, 5]);
        });

        it('should handle empty input array', () => {
            const input: number[] = [];
            const valuesToRemove = [1, 2, 3];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([]);
        });

        it('should handle array where all values are removed', () => {
            const input = [1, 2, 3];
            const valuesToRemove = [1, 2, 3];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([]);
        });

        it('should handle array with values that do not exist', () => {
            const input = [1, 2, 3];
            const valuesToRemove = [4, 5, 6];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([1, 2, 3]);
        });

        it('should handle duplicate values in the original array', () => {
            const input = [1, 2, 2, 3, 2, 4];
            const valuesToRemove = [2];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([1, 3, 4]);
        });

        it('should handle duplicate values to remove', () => {
            const input = [1, 2, 3, 4, 5];
            const valuesToRemove = [2, 2, 2];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual([1, 3, 4, 5]);
        });

        it('should work with string arrays', () => {
            const input = ['apple', 'banana', 'cherry', 'date'];
            const valuesToRemove = ['banana', 'date'];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual(['apple', 'cherry']);
        });

        it('should work with mixed type arrays (using any)', () => {
            const input: any[] = [1, '1', 2, '2', true, 'true'];
            const valuesToRemove: any[] = [1, '2', true];
            const result = removeValues(input, valuesToRemove);
            expect(result).toEqual(['1', 2, 'true']);
        });

        it('should work with object arrays', () => {
            const obj1 = { id: 1 };
            const obj2 = { id: 2 };
            const obj3 = { id: 3 };
            const obj4 = { id: 2 }; // Different object but same content

            const input = [obj1, obj2, obj3, obj4];
            const valuesToRemove = [obj2];
            const result = removeValues(input, valuesToRemove);

            expect(result).toEqual([obj1, obj3, obj4]); // obj2 removed, obj4 remains because it's a different reference
        });
    });

    describe('splitArray', () => {
        it('should split array based on a simple condition', () => {
            const input = [1, 2, 3, 4, 5, 6];
            const condition = (item: number) => item % 2 === 0;
            const [evens, odds] = splitArray(input, condition);

            expect(evens).toEqual([2, 4, 6]);
            expect(odds).toEqual([1, 3, 5]);
        });

        it('should handle empty array', () => {
            const input: number[] = [];
            const condition = (item: number) => item > 0;
            const [matches, nonMatches] = splitArray(input, condition);

            expect(matches).toEqual([]);
            expect(nonMatches).toEqual([]);
        });

        it('should handle array with all elements matching condition', () => {
            const input = [2, 4, 6, 8];
            const condition = (item: number) => item % 2 === 0;
            const [matches, nonMatches] = splitArray(input, condition);

            expect(matches).toEqual([2, 4, 6, 8]);
            expect(nonMatches).toEqual([]);
        });

        it('should handle array with no elements matching condition', () => {
            const input = [1, 3, 5, 7];
            const condition = (item: number) => item % 2 === 0;
            const [matches, nonMatches] = splitArray(input, condition);

            expect(matches).toEqual([]);
            expect(nonMatches).toEqual([1, 3, 5, 7]);
        });

        it('should use index in condition function', () => {
            const input = ['a', 'b', 'c', 'd', 'e'];
            const condition = (item: string, index: number) => index % 2 === 0;
            const [matches, nonMatches] = splitArray(input, condition);

            expect(matches).toEqual(['a', 'c', 'e']); // indices 0, 2, 4
            expect(nonMatches).toEqual(['b', 'd']); // indices 1, 3
        });

        it('should handle string array with condition', () => {
            const input = ['apple', 'banana', 'cherry', 'date'];
            const condition = (item: string) => item.length > 5;
            const [long, short] = splitArray(input, condition);

            expect(long).toEqual(['banana', 'cherry']);
            expect(short).toEqual(['apple', 'date']);
        });

        it('should handle object array with condition', () => {
            const input = [
                { name: 'John', age: 25 },
                { name: 'Jane', age: 30 },
                { name: 'Bob', age: 20 },
                { name: 'Alice', age: 35 },
            ];
            const condition = (item: { name: string; age: number }) => item.age >= 30;
            const [adults, minors] = splitArray(input, condition);

            expect(adults).toEqual([
                { name: 'Jane', age: 30 },
                { name: 'Alice', age: 35 },
            ]);
            expect(minors).toEqual([
                { name: 'John', age: 25 },
                { name: 'Bob', age: 20 },
            ]);
        });

        it('should handle condition that throws an error', () => {
            const input = [1, 2, 3, 4, 5];
            const condition = (item: number) => {
                if (item === 3) throw new Error('Intentional error');
                return item % 2 === 0;
            };

            // Capture console.error calls
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const [matches, nonMatches] = splitArray(input, condition);

            // Verify the error was logged
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in condition function at index 2:',
                new Error('Intentional error')
            );

            // Items at indices 0 and 1 are processed, item at index 2 throws error, items at indices 3 and 4 are processed
            expect(matches).toEqual([2, 4]); // 2 and 4 are even numbers
            expect(nonMatches).toEqual([1, 5]); // 1 and 5 are odd numbers

            consoleSpy.mockRestore();
        });

        it('should work with complex condition', () => {
            const input = [1, -2, 3, -4, 0, 7];
            const condition = (item: number) => item >= 0 && item % 2 === 0;
            const [matches, nonMatches] = splitArray(input, condition);

            expect(matches).toEqual([0]); // Only 0 is non-negative and even
            expect(nonMatches).toEqual([1, -2, 3, -4, 7]);
        });

        it('should handle array with undefined and null values', () => {
            const input = [1, null, 'hello', undefined, 0, false];
            const condition = (item: any) => item;
            const [truthy, falsy] = splitArray(input, condition);

            expect(truthy).toEqual([1, 'hello']);
            expect(falsy).toEqual([null, undefined, 0, false]);
        });
    });
});
