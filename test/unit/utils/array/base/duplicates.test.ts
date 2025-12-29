import { removeDuplicates, uniqueBy } from '@/utils/array/base/duplicates';

describe('duplicates utility functions', () => {
  describe('removeDuplicates', () => {
    it('should remove duplicate primitive values', () => {
      const input = [1, 2, 2, 3, 4, 4, 5];
      const result = removeDuplicates(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle array with no duplicates', () => {
      const input = [1, 2, 3, 4, 5];
      const result = removeDuplicates(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty array', () => {
      const input: number[] = [];
      const result = removeDuplicates(input);
      expect(result).toEqual([]);
    });

    it('should handle array with one element', () => {
      const input = [42];
      const result = removeDuplicates(input);
      expect(result).toEqual([42]);
    });

    it('should handle array with all duplicates', () => {
      const input = [7, 7, 7, 7];
      const result = removeDuplicates(input);
      expect(result).toEqual([7]);
    });

    it('should handle string arrays', () => {
      const input = ['apple', 'banana', 'apple', 'cherry', 'banana'];
      const result = removeDuplicates(input);
      expect(result).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should handle mixed primitive types', () => {
      const input = [1, '1', 2, '2', true, 'true', null, undefined, null];
      const result = removeDuplicates(input);
      expect(result).toEqual([1, '1', 2, '2', true, 'true', null, undefined]);
    });

    it('should handle boolean values', () => {
      const input = [true, false, true, false, true];
      const result = removeDuplicates(input);
      expect(result).toEqual([true, false]);
    });

    it('should handle null and undefined values', () => {
      const input = [null, undefined, null, undefined, 'test', null];
      const result = removeDuplicates(input);
      expect(result).toEqual([null, undefined, 'test']);
    });

    it('should preserve object references but not remove duplicate objects', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 1 }; // Same content but different reference
      const input = [obj1, obj2, obj1, obj3];
      const result = removeDuplicates(input);

      // Only actual duplicate references are removed (obj1 appears twice)
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(obj1);
      expect(result[1]).toBe(obj2);
      expect(result[2]).toBe(obj3);
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates based on primitive property', () => {
      const input = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John2' },
        { id: 3, name: 'Bob' },
      ];
      const result = uniqueBy(input, 'id');
      expect(result).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' },
      ]);
    });

    it('should remove duplicates based on string property', () => {
      const input = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'John' },
        { id: 4, name: 'Bob' },
      ];
      const result = uniqueBy(input, 'name');
      expect(result).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 4, name: 'Bob' },
      ]);
    });

    it('should handle empty array', () => {
      const input: Array<{ id: number; name: string }> = [];
      const result = uniqueBy(input, 'id');
      expect(result).toEqual([]);
    });

    it('should handle array with one element', () => {
      const input = [{ id: 1, name: 'John' }];
      const result = uniqueBy(input, 'id');
      expect(result).toEqual([{ id: 1, name: 'John' }]);
    });

    it('should work with function as key selector', () => {
      const input = [
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Doe' },
        { firstName: 'John', lastName: 'Smith' },
      ];
      const result = uniqueBy(input, (item) => item.firstName);
      expect(result).toEqual([
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Doe' },
      ]);
    });

    it('should work with function that computes a value', () => {
      const input = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Alice', age: 25 },
      ];
      // Unique by age group (young if age < 30)
      const result = uniqueBy(input, (item) => (item.age < 30 ? 'young' : 'mature'));
      expect(result).toEqual([
        { name: 'John', age: 30 }, // First 'mature' item (age >= 30)
        { name: 'Jane', age: 25 }, // First 'young' item (age < 30)
      ]);
    });

    it('should handle duplicates with function selector', () => {
      const input = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
        { name: 'John2', email: 'john@example.com' },
      ];
      const result = uniqueBy(input, (item) => item.email);
      expect(result).toEqual([
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ]);
    });

    it('should handle objects with undefined property', () => {
      const input = [
        { id: 1, name: 'John' },
        { id: 2, name: undefined },
        { id: 3, name: undefined },
        { id: 4, name: 'Jane' },
      ];
      const result = uniqueBy(input, 'name');
      expect(result).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: undefined },
        { id: 4, name: 'Jane' },
      ]);
    });

    it('should work with numeric properties', () => {
      const input = [
        { id: 1, score: 90 },
        { id: 2, score: 85 },
        { id: 3, score: 90 },
        { id: 4, score: 85 },
      ];
      const result = uniqueBy(input, 'score');
      expect(result).toEqual([
        { id: 1, score: 90 },
        { id: 2, score: 85 },
      ]);
    });

    it('should preserve the first occurrence of duplicates', () => {
      const input = [
        { id: 1, name: 'John', extra: 'first' },
        { id: 2, name: 'Jane', extra: 'second' },
        { id: 3, name: 'John', extra: 'third' },
      ];
      const result = uniqueBy(input, 'name');
      expect(result).toEqual([
        { id: 1, name: 'John', extra: 'first' }, // First John is kept
        { id: 2, name: 'Jane', extra: 'second' },
      ]);
    });
  });
});