import { sortBy } from '../../../../../src/utils/array/sort/sortBy';

describe('sortBy utility function', () => {
  it('should sort array by field in ascending order', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const result = sortBy(people, 'age');
    expect(result).toEqual([
      { name: 'Jane', age: 25 },
      { name: 'John', age: 30 },
      { name: 'Bob', age: 35 },
    ]);
  });

  it('should sort array by field in descending order', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const result = sortBy(people, 'age', 'desc');
    expect(result).toEqual([
      { name: 'Bob', age: 35 },
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]);
  });

  it('should handle empty array', () => {
    const result = sortBy([], 'name');
    expect(result).toEqual([]);
  });

  it('should handle array with one element', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [{ name: 'John', age: 30 }];
    const result = sortBy(people, 'age');
    expect(result).toEqual([{ name: 'John', age: 30 }]);
  });

  it('should handle null and undefined values', () => {
    interface Person {
      name: string;
      age: number | null;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: null },
      { name: 'Bob', age: 25 },
      { name: 'Alice', age: undefined as any },
    ];

    const result = sortBy(people, 'age');
    expect(result).toEqual([
      { name: 'Jane', age: null },
      { name: 'Alice', age: undefined as any },
      { name: 'Bob', age: 25 },
      { name: 'John', age: 30 },
    ]);
  });

  it('should sort by string field', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const result = sortBy(people, 'name');
    expect(result).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
      { name: 'John', age: 30 },
    ]);
  });

  it('should sort by date field', () => {
    interface Event {
      name: string;
      date: Date;
    }

    const events: Event[] = [
      { name: 'Event A', date: new Date(2023, 5, 15) },
      { name: 'Event B', date: new Date(2023, 2, 10) },
      { name: 'Event C', date: new Date(2023, 8, 20) },
    ];

    const result = sortBy(events, 'date');
    expect(result).toEqual([
      { name: 'Event B', date: new Date(2023, 2, 10) },
      { name: 'Event A', date: new Date(2023, 5, 15) },
      { name: 'Event C', date: new Date(2023, 8, 20) },
    ]);
  });

  it('should not modify original array', () => {
    interface Person {
      name: string;
      age: number;
    }

    const original: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    const originalCopy = [...original];
    const result = sortBy(original, 'age');

    expect(original).toEqual(originalCopy);
    expect(result).not.toBe(original);
  });
});