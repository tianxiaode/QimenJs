import { groupBy, countBy } from '@/utils/array/collection/groupBy';

describe('groupBy utility function', () => {
  it('should group array elements by a specified key', () => {
    interface Person {
      name: string;
      age: number;
      city: string;
    }

    const people: Person[] = [
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'London' },
      { name: 'Charlie', age: 25, city: 'New York' },
      { name: 'David', age: 30, city: 'London' },
    ];

    const result = groupBy(people, 'city');
    expect(result.size).toBe(2);
    expect(result.get('New York')).toEqual([
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Charlie', age: 25, city: 'New York' }
    ]);
    expect(result.get('London')).toEqual([
      { name: 'Bob', age: 30, city: 'London' },
      { name: 'David', age: 30, city: 'London' }
    ]);
  });

  it('should handle grouping by numeric key', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 25 },
    ];

    const result = groupBy(people, 'age');
    expect(result.size).toBe(2);
    expect(result.get(25)).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Charlie', age: 25 }
    ]);
    expect(result.get(30)).toEqual([
      { name: 'Bob', age: 30 }
    ]);
  });

  it('should handle empty array', () => {
    interface Person {
      name: string;
      city: string;
    }

    const people: Person[] = [];
    const result = groupBy(people, 'city');
    expect(result.size).toBe(0);
  });

  it('should handle array with one element', () => {
    interface Person {
      name: string;
      city: string;
    }

    const people: Person[] = [{ name: 'Alice', city: 'New York' }];
    const result = groupBy(people, 'city');
    expect(result.size).toBe(1);
    expect(result.get('New York')).toEqual([{ name: 'Alice', city: 'New York' }]);
  });

  it('should handle all elements having the same key value', () => {
    interface Person {
      name: string;
      city: string;
    }

    const people: Person[] = [
      { name: 'Alice', city: 'New York' },
      { name: 'Bob', city: 'New York' },
      { name: 'Charlie', city: 'New York' },
    ];

    const result = groupBy(people, 'city');
    expect(result.size).toBe(1);
    expect(result.get('New York')).toEqual(people);
  });

  it('should handle all elements having different key values', () => {
    interface Person {
      name: string;
      id: number;
    }

    const people: Person[] = [
      { name: 'Alice', id: 1 },
      { name: 'Bob', id: 2 },
      { name: 'Charlie', id: 3 },
    ];

    const result = groupBy(people, 'id');
    expect(result.size).toBe(3);
    expect(result.get(1)).toEqual([{ name: 'Alice', id: 1 }]);
    expect(result.get(2)).toEqual([{ name: 'Bob', id: 2 }]);
    expect(result.get(3)).toEqual([{ name: 'Charlie', id: 3 }]);
  });
});

describe('countBy utility function', () => {
  it('should count elements by a classifier function', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const result = countBy(numbers, (num) => num % 2 === 0 ? 'even' : 'odd');
    expect(result.size).toBe(2);
    expect(result.get('even')).toBe(3); // 2, 4, 6
    expect(result.get('odd')).toBe(3);  // 1, 3, 5
  });

  it('should count elements without classifier (using elements as keys)', () => {
    const items = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
    const result = countBy(items);
    expect(result.size).toBe(3);
    expect(result.get('apple')).toBe(3);
    expect(result.get('banana')).toBe(2);
    expect(result.get('cherry')).toBe(1);
  });

  it('should handle empty array', () => {
    const items: string[] = [];
    const result = countBy(items);
    expect(result.size).toBe(0);
  });

  it('should handle array with one element', () => {
    const items = ['apple'];
    const result = countBy(items);
    expect(result.size).toBe(1);
    expect(result.get('apple')).toBe(1);
  });

  it('should handle numbers array', () => {
    const numbers = [1, 2, 2, 3, 3, 3];
    const result = countBy(numbers);
    expect(result.size).toBe(3);
    expect(result.get(1)).toBe(1);
    expect(result.get(2)).toBe(2);
    expect(result.get(3)).toBe(3);
  });

  it('should handle objects with classifier', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 25 },
      { name: 'David', age: 35 },
    ];

    const result = countBy(people, (person) => person.age);
    expect(result.size).toBe(3);
    expect(result.get(25)).toBe(2);
    expect(result.get(30)).toBe(1);
    expect(result.get(35)).toBe(1);
  });

  it('should handle boolean classifier', () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = countBy(numbers, (num) => num > 4);
    expect(result.size).toBe(2);
    expect(result.get(false)).toBe(4); // 1, 2, 3, 4
    expect(result.get(true)).toBe(4);  // 5, 6, 7, 8
  });

  it('should work with complex classifier function', () => {
    const words = ['hello', 'world', 'foo', 'bar', 'test'];
    // 'hello' (5) -> long, 'world' (5) -> long, 'foo' (3) -> short, 'bar' (3) -> short, 'test' (4) -> long
    const result = countBy(words, (word) => word.length > 3 ? 'long' : 'short');
    expect(result.size).toBe(2);
    expect(result.get('long')).toBe(3);  // 'hello', 'world', 'test'
    expect(result.get('short')).toBe(2); // 'foo', 'bar'
  });
});