import { intersection, intersectionBy } from '../../../../../src/utils/array/set/intersection';

describe('intersection utility functions', () => {
  describe('intersection', () => {
    it('should return elements that exist in both arrays', () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [3, 4, 5, 6, 7];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([3, 4, 5]);
    });

    it('should handle empty first array', () => {
      const arr1: number[] = [];
      const arr2 = [1, 2, 3];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([]);
    });

    it('should handle empty second array', () => {
      const arr1 = [1, 2, 3];
      const arr2: number[] = [];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([]);
    });

    it('should handle both arrays empty', () => {
      const arr1: number[] = [];
      const arr2: number[] = [];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([]);
    });

    it('should work with string arrays', () => {
      const arr1 = ['apple', 'banana', 'cherry', 'date'];
      const arr2 = ['banana', 'date', 'elderberry', 'fig'];
      const result = intersection(arr1, arr2);
      expect(result).toEqual(['banana', 'date']);
    });

    it('should work with duplicate values', () => {
      const arr1 = [1, 2, 2, 3, 3, 4];
      const arr2 = [2, 3, 3, 4, 5];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([2, 2, 3, 3, 4]); // Keeps duplicates from first array
    });

    it('should work with mixed types', () => {
      const arr1 = [1, 'hello', true, null, undefined];
      const arr2 = ['hello', true, undefined, 'world', 42];
      const result = intersection(arr1, arr2);
      expect(result).toEqual(['hello', true, undefined]);
    });

    it('should work with identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should work with completely different arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      const result = intersection(arr1, arr2);
      expect(result).toEqual([]);
    });
  });

  describe('intersectionBy', () => {
    it('should return elements that exist in both arrays based on field', () => {
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

      const result = intersectionBy(arr1, arr2, 'id');
      expect(result).toEqual([{ id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }]);
    });

    it('should handle empty first array', () => {
      interface Person {
        id: number;
        name: string;
      }

      const arr1: Person[] = [];
      const arr2: Person[] = [{ id: 1, name: 'Alice' }];
      const result = intersectionBy(arr1, arr2, 'id');
      expect(result).toEqual([]);
    });

    it('should handle empty second array', () => {
      interface Person {
        id: number;
        name: string;
      }

      const arr1: Person[] = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
      const arr2: Person[] = [];
      const result = intersectionBy(arr1, arr2, 'id');
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
        { id: 3, name: 'Phone', category: 'Electronics' },
      ];

      const arr2: Product[] = [
        { id: 5, name: 'Tablet', category: 'Electronics' },
        { id: 6, name: 'Notebook', category: 'Education' },
        { id: 7, name: 'Watch', category: 'Fashion' },
      ];

      const result = intersectionBy(arr1, arr2, 'category');
      // All items in arr1 that have a matching category in arr2
      // 'Laptop' and 'Phone' have category 'Electronics' which exists in arr2
      // 'Book' has category 'Education' which exists in arr2
      expect(result).toEqual([
        { id: 1, name: 'Laptop', category: 'Electronics' },
        { id: 2, name: 'Book', category: 'Education' },
        { id: 3, name: 'Phone', category: 'Electronics' },
      ]);
    });

    it('should work with numeric field', () => {
      interface Score {
        id: number;
        name: string;
        value: number;
      }

      const arr1: Score[] = [
        { id: 1, name: 'Alice', value: 85 },
        { id: 2, name: 'Bob', value: 92 },
        { id: 3, name: 'Charlie', value: 85 },
      ];

      const arr2: Score[] = [
        { id: 4, name: 'David', value: 85 },
        { id: 5, name: 'Eve', value: 78 },
        { id: 6, name: 'Frank', value: 92 },
      ];

      const result = intersectionBy(arr1, arr2, 'value');
      // 'Alice' and 'Charlie' have value 85 which exists in arr2
      // 'Bob' has value 92 which exists in arr2
      expect(result).toEqual([
        { id: 1, name: 'Alice', value: 85 },
        { id: 2, name: 'Bob', value: 92 },
        { id: 3, name: 'Charlie', value: 85 },
      ]);
    });
  });
});