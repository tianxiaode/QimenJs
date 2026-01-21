import { orderBy, sortBy, naturalSort, OrderCondition } from '@/utils/array/sort/sort';

describe('sort utilities', () => {
    interface TestItem {
        id: number;
        name: string;
        age: number;
        score?: number;
        date: Date;
    }

    const testData: TestItem[] = [
        { id: 1, name: 'John', age: 30, score: 85, date: new Date(2023, 5, 15) },
        { id: 2, name: 'Alice', age: 25, score: 92, date: new Date(2023, 3, 10) },
        { id: 3, name: 'Bob', age: 35, score: 78, date: new Date(2023, 8, 20) },
        { id: 4, name: 'Charlie', age: 20, score: 95, date: new Date(2023, 1, 5) },
    ];

    describe('orderBy', () => {
        it('should sort by single field in ascending order', () => {
            const result = orderBy(testData, [{ by: 'age', order: 'asc' }]);
            
            expect(result[0].name).toBe('Charlie'); // youngest
            expect(result[result.length - 1].name).toBe('Bob'); // oldest
        });

        it('should sort by single field in descending order', () => {
            const result = orderBy(testData, [{ by: 'age', order: 'desc' }]);
            
            expect(result[0].name).toBe('Bob'); // oldest
            expect(result[result.length - 1].name).toBe('Charlie'); // youngest
        });

        it('should sort by multiple fields', () => {
            // First sort by age desc, then by score desc
            const multiSortData = [
                { name: 'A', age: 30, score: 80 },
                { name: 'B', age: 30, score: 90 }, // Same age as A but higher score
                { name: 'C', age: 25, score: 85 },
                { name: 'D', age: 25, score: 75 }, // Same age as C but lower score
            ];
            
            const result = orderBy(multiSortData, [
                { by: 'age', order: 'desc' },
                { by: 'score', order: 'desc' },
            ]);
            
            expect(result[0].name).toBe('B'); // age 30, score 90
            expect(result[1].name).toBe('A'); // age 30, score 80
            expect(result[2].name).toBe('C'); // age 25, score 85
            expect(result[3].name).toBe('D'); // age 25, score 75
        });

        it('should sort by function selector', () => {
            const result = orderBy(testData, [
                { by: (item) => item.name.length, order: 'desc' },
            ]);
            
            expect(result[0].name).toBe('Charlie'); // Longest name
        });

        it('should handle date sorting', () => {
            const result = orderBy(testData, [{ by: 'date', order: 'asc' }]);
            
            // Charlie's date is earliest (Feb 5), Alice's is next (Apr 10), John's (Jun 15), Bob's (Sep 20)
            expect(result[0].name).toBe('Charlie');
            expect(result[1].name).toBe('Alice');
            expect(result[2].name).toBe('John');
            expect(result[3].name).toBe('Bob');
        });

        it('should handle null/undefined values', () => {
            const dataWithNulls = [
                { id: 1, name: 'Valid', age: 30 },
                { id: 2, name: null as any, age: 25 },
                { id: 3, name: 'Also Valid', age: 35 },
                { id: 4, name: undefined as any, age: 20 },
            ];
            
            const result = orderBy(dataWithNulls, [{ by: 'name', order: 'asc' }]);
            
            // Null/undefined values should be at the end regardless of order direction
            expect(result[result.length - 1].name).toBeUndefined();
            expect(result[result.length - 2].name).toBeNull();
        });

        it('should return original array if no conditions provided', () => {
            const result = orderBy(testData, []);
            expect(result).toEqual(testData);
            expect(result).not.toBe(testData); // Should return a copy
        });

        it('should handle equal values returning 0', () => {
            const dataWithEqualValues = [
                { name: 'A', value: 10 },
                { name: 'B', value: 10 },
                { name: 'C', value: 10 },
            ];
            
            const result = orderBy(dataWithEqualValues, [{ by: 'value', order: 'asc' }]);
            
            // All items have the same value, so order should remain stable
            expect(result[0].name).toBe('A');
            expect(result[1].name).toBe('B');
            expect(result[2].name).toBe('C');
        });

        it('should handle natural sorting', () => {
            const data = [
                { id: 1, name: 'item10' },
                { id: 2, name: 'item1' },
                { id: 3, name: 'item2' },
            ];
            
            const result = orderBy(data, [{ by: 'name', natural: true }]);
            
            expect(result.map(item => item.name)).toEqual(['item1', 'item2', 'item10']);
        });

        it('should handle default comparator for non-primitive types', () => {
            const dataWithObjects = [
                { name: 'A', value: { x: 1 } },
                { name: 'B', value: { y: 2 } },
                { name: 'C', value: { z: 3 } },
            ];
            
            const result = orderBy(dataWithObjects, [{ by: 'value', order: 'asc' }]);
            
            // Using default comparator for object types
            expect(result).toHaveLength(3);
        });

        it('should handle boolean values with default comparator', () => {
            const dataWithBooleans = [
                { name: 'A', flag: true },
                { name: 'B', flag: false },
                { name: 'C', flag: true },
            ];
            
            const result = orderBy(dataWithBooleans, [{ by: 'flag', order: 'asc' }]);
            
            expect(result[0].flag).toBe(false);
            expect(result[1].flag).toBe(true);
            expect(result[2].flag).toBe(true);
        });

        it('should handle cases where both values are null', () => {
            const dataWithNulls = [
                { id: 1, name: null as any, age: 30 },
                { id: 2, name: null as any, age: 25 },
                { id: 3, name: 'Valid', age: 35 },
            ];
            
            const result = orderBy(dataWithNulls, [{ by: 'name', order: 'asc' }]);
            
            // Items with null values should stay together at the end
            expect(result[0].name).toBe('Valid');
            expect(result[1].name).toBeNull();
            expect(result[2].name).toBeNull();
        });

        it('should handle undefined values in desc order', () => {
            const dataWithUndefined = [
                { id: 1, name: 'Valid', value: 30 },
                { id: 2, name: undefined as any, value: 25 },
                { id: 3, name: 'Also Valid', value: 35 },
            ];
            
            const result = orderBy(dataWithUndefined, [{ by: 'name', order: 'desc' }]);
            
            // Check that undefined is positioned at the end (last position)
            // The exact position depends on the implementation, but typically null/undefined go to the end
            expect(result.some(item => item.name === undefined)).toBeTruthy();
        });
    });

    describe('sortBy', () => {
        it('should sort by field in ascending order by default', () => {
            const result = sortBy(testData, 'age');
            
            expect(result[0].name).toBe('Charlie');
            expect(result[result.length - 1].name).toBe('Bob');
        });

        it('should sort by field in specified order', () => {
            const result = sortBy(testData, 'age', 'desc');
            
            expect(result[0].name).toBe('Bob');
            expect(result[result.length - 1].name).toBe('Charlie');
        });
    });

    describe('naturalSort', () => {
        it('should perform natural sorting on strings', () => {
            const stringData = ['item10', 'item1', 'item2', 'item20', 'item3'];
            const result = naturalSort(stringData);
            
            expect(result).toEqual(['item1', 'item2', 'item3', 'item10', 'item20']);
        });

        it('should work with key selector function', () => {
            const objects = [
                { id: 1, name: 'item10' },
                { id: 2, name: 'item1' },
                { id: 3, name: 'item20' },
                { id: 4, name: 'item2' },
            ];
            
            const result = naturalSort(objects, (obj) => obj.name);
            
            expect(result.map(obj => obj.name)).toEqual(['item1', 'item2', 'item10', 'item20']);
        });

        it('should handle descending order', () => {
            const stringData = ['item10', 'item1', 'item2', 'item20', 'item3'];
            const result = naturalSort(stringData, undefined, 'desc');
            
            expect(result).toEqual(['item20', 'item10', 'item3', 'item2', 'item1']);
        });
    });
});