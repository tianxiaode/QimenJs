import {
    difference,
    differenceBy,
    differenceWith,
    symmetricDifference,
    symmetricDifferenceBy,
    symmetricDifferenceWith,
} from '../../../../../src/utils/array/set/difference';

describe('difference utility functions', () => {
    describe('difference', () => {
        it('should return elements in first array but not in second', () => {
            const arr1 = [1, 2, 3, 4, 5];
            const arr2 = [2, 4];
            const result = difference(arr1, arr2);
            expect(result).toEqual([1, 3, 5]);
        });

        it('should handle empty first array', () => {
            const arr1: number[] = [];
            const arr2 = [1, 2, 3];
            const result = difference(arr1, arr2);
            expect(result).toEqual([]);
        });

        it('should handle empty second array', () => {
            const arr1 = [1, 2, 3];
            const arr2: number[] = [];
            const result = difference(arr1, arr2);
            expect(result).toEqual([1, 2, 3]);
        });

        it('should handle both arrays empty', () => {
            const arr1: number[] = [];
            const arr2: number[] = [];
            const result = difference(arr1, arr2);
            expect(result).toEqual([]);
        });

        it('should work with string arrays', () => {
            const arr1 = ['apple', 'banana', 'cherry', 'date'];
            const arr2 = ['banana', 'date'];
            const result = difference(arr1, arr2);
            expect(result).toEqual(['apple', 'cherry']);
        });

        it('should work with duplicate values', () => {
            const arr1 = [1, 2, 2, 3, 3, 4];
            const arr2 = [2, 4];
            const result = difference(arr1, arr2);
            expect(result).toEqual([1, 3, 3]);
        });
    });

    describe('differenceBy', () => {
        it('should return elements in first array but not in second based on field', () => {
            interface Person {
                id: number;
                name: string;
            }

            const arr1: Person[] = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charlie' },
            ];

            const arr2: Person[] = [
                { id: 2, name: 'Bob' },
                { id: 4, name: 'David' },
            ];

            const result = differenceBy(arr1, arr2, 'id');
            expect(result).toEqual([
                { id: 1, name: 'Alice' },
                { id: 3, name: 'Charlie' },
            ]);
        });

        it('should handle empty first array', () => {
            interface Person {
                id: number;
                name: string;
            }

            const arr1: Person[] = [];
            const arr2: Person[] = [{ id: 1, name: 'Alice' }];
            const result = differenceBy(arr1, arr2, 'id');
            expect(result).toEqual([]);
        });

        it('should handle empty second array', () => {
            interface Person {
                id: number;
                name: string;
            }

            const arr1: Person[] = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ];
            const arr2: Person[] = [];
            const result = differenceBy(arr1, arr2, 'id');
            expect(result).toEqual([
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ]);
        });

        it('should work with string field', () => {
            interface Product {
                id: number;
                name: string;
                category: string;
            }

            const arr1: Product[] = [
                { id: 1, name: 'Laptop', category: 'Electronics' },
                { id: 2, name: 'Book', category: 'Education' },
                { id: 3, name: 'Phone', category: 'Electronics' },
            ];

            const arr2: Product[] = [
                { id: 5, name: 'Tablet', category: 'Electronics' },
                { id: 6, name: 'Notebook', category: 'Education' },
            ];

            const result = differenceBy(arr1, arr2, 'category');
            expect(result).toEqual([]); // All categories in arr1 exist in arr2
        });
    });

    describe('differenceWith', () => {
        it('should return elements in first array but not in second based on iteratee', () => {
            const arr1 = [1.1, 1.2, 1.3, 1.4];
            const arr2 = [2.1, 2.2, 2.3];
            const result = differenceWith(arr1, arr2, Math.floor);
            // Math.floor(1.1) = 1, Math.floor(1.2) = 1, Math.floor(1.3) = 1, Math.floor(1.4) = 1
            // Math.floor(2.1) = 2, Math.floor(2.2) = 2, Math.floor(2.3) = 2
            // Since 1 !== 2, all elements from arr1 should be in the result
            expect(result).toEqual([1.1, 1.2, 1.3, 1.4]);
        });

        it('should handle empty first array', () => {
            const arr1: number[] = [];
            const arr2 = [1, 2, 3];
            const result = differenceWith(arr1, arr2, Math.floor);
            expect(result).toEqual([]);
        });

        it('should handle empty second array', () => {
            const arr1 = [1.1, 1.2, 1.3];
            const arr2: number[] = [];
            const result = differenceWith(arr1, arr2, Math.floor);
            expect(result).toEqual([1.1, 1.2, 1.3]);
        });

        it('should work with string transformation', () => {
            const arr1 = ['hello', 'world', 'test'];
            const arr2 = ['hi', 'earth', 'example'];
            const result = differenceWith(arr1, arr2, str => str.length);
            // Lengths: 'hello'=5, 'world'=5, 'test'=4
            // Lengths: 'hi'=2, 'earth'=5, 'example'=7
            // 'hello' and 'world' have length 5 which matches 'earth' length, so they are excluded
            // 'test' has length 4 which doesn't match any in arr2, so it's included
            expect(result).toEqual(['test']);
        });
    });

    describe('symmetricDifference', () => {
        it('should return elements that are in either array but not both', () => {
            const arr1 = [1, 2, 3];
            const arr2 = [3, 4, 5];
            const result = symmetricDifference(arr1, arr2);
            expect(result).toEqual([1, 2, 4, 5]);
        });

        it('should handle completely different arrays', () => {
            const arr1 = [1, 2, 3];
            const arr2 = [4, 5, 6];
            const result = symmetricDifference(arr1, arr2);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('should handle identical arrays', () => {
            const arr1 = [1, 2, 3];
            const arr2 = [1, 2, 3];
            const result = symmetricDifference(arr1, arr2);
            expect(result).toEqual([]);
        });

        it('should handle empty arrays', () => {
            const arr1: number[] = [];
            const arr2: number[] = [];
            const result = symmetricDifference(arr1, arr2);
            expect(result).toEqual([]);
        });

        it('should handle one empty array', () => {
            const arr1 = [1, 2, 3];
            const arr2: number[] = [];
            const result = symmetricDifference(arr1, arr2);
            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe('symmetricDifferenceBy', () => {
        it('should return elements that are in either array but not both based on field', () => {
            interface Person {
                id: number;
                name: string;
            }

            const arr1: Person[] = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charlie' },
            ];

            const arr2: Person[] = [
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charles' }, // Different name but same id
                { id: 4, name: 'David' },
            ];

            const result = symmetricDifferenceBy(arr1, arr2, 'id');
            expect(result).toEqual([
                { id: 1, name: 'Alice' },
                { id: 4, name: 'David' },
            ]);
        });

        it('should handle empty arrays', () => {
            interface Person {
                id: number;
                name: string;
            }

            const arr1: Person[] = [];
            const arr2: Person[] = [];
            const result = symmetricDifferenceBy(arr1, arr2, 'id');
            expect(result).toEqual([]);
        });

        it('should work with string field', () => {
            interface Product {
                id: number;
                name: string;
                category: string;
            }

            const arr1: Product[] = [
                { id: 1, name: 'Laptop', category: 'Electronics' },
                { id: 2, name: 'Book', category: 'Education' },
            ];

            const arr2: Product[] = [
                { id: 3, name: 'Phone', category: 'Electronics' },
                { id: 4, name: 'Magazine', category: 'Entertainment' },
            ];

            const result = symmetricDifferenceBy(arr1, arr2, 'category');
            expect(result).toEqual([
                { id: 2, name: 'Book', category: 'Education' },
                { id: 4, name: 'Magazine', category: 'Entertainment' },
            ]);
        });
    });

    describe('symmetricDifferenceWith', () => {
        it('should return elements that are in either array but not both based on iteratee', () => {
            const arr1 = [1.1, 1.2, 1.3];
            const arr2 = [2.4, 2.5, 1.4];
            const result = symmetricDifferenceWith(arr1, arr2, Math.floor);
            // Math.floor([1.1, 1.2, 1.3]) = [1, 1, 1]
            // Math.floor([2.4, 2.5, 1.4]) = [2, 2, 1]
            // Value 1 appears in both arrays (1.3 in arr1 and 1.4 in arr2), so these are excluded
            // Values 2 only appears in arr2, so 2.4 and 2.5 are included in result
            expect(result).toEqual([2.4, 2.5]);
        });

        it('should handle empty arrays', () => {
            const arr1: number[] = [];
            const arr2: number[] = [];
            const result = symmetricDifferenceWith(arr1, arr2, Math.floor);
            expect(result).toEqual([]);
        });

        it('should work with string transformation', () => {
            const arr1 = ['hello', 'world'];
            const arr2 = ['hi', 'earth'];
            const result = symmetricDifferenceWith(arr1, arr2, str => str.length);
            // Lengths: 'hello'=5, 'world'=5
            // Lengths: 'hi'=2, 'earth'=5
            // Length 5 appears in both arrays ('hello'/'world' in arr1 and 'earth' in arr2), so these are excluded
            // Length 2 only appears in arr2, so 'hi' is included in result
            expect(result).toEqual(['hi']);
        });
    });
});
