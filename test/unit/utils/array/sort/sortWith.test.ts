import { sortWith } from '../../../../../src/utils/array/sort/sortWith';

describe('sortWith utility function', () => {
  it('should sort array using custom compare function in ascending order', () => {
    const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
    const result = sortWith(numbers, (a, b) => a - b);
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
  });

  it('should sort array using custom compare function in descending order', () => {
    const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
    const result = sortWith(numbers, (a, b) => b - a);
    expect(result).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
  });

  it('should sort string array using custom compare function', () => {
    const strings = ['banana', 'apple', 'cherry', 'date'];
    const result = sortWith(strings, (a, b) => a.localeCompare(b));
    expect(result).toEqual(['apple', 'banana', 'cherry', 'date']);
  });

  it('should handle empty array', () => {
    const result = sortWith([], (a, b) => a - b);
    expect(result).toEqual([]);
  });

  it('should handle array with one element', () => {
    const numbers = [42];
    const result = sortWith(numbers, (a, b) => a - b);
    expect(result).toEqual([42]);
  });

  it('should handle object array with custom compare function', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const result = sortWith(people, (a, b) => a.age - b.age);
    expect(result).toEqual([
      { name: 'Jane', age: 25 },
      { name: 'John', age: 30 },
      { name: 'Bob', age: 35 },
    ]);
  });

  it('should not modify original array', () => {
    const original = [3, 1, 4, 1, 5];
    const originalCopy = [...original];
    const result = sortWith(original, (a, b) => a - b);

    expect(original).toEqual(originalCopy);
    expect(result).not.toBe(original);
  });
});