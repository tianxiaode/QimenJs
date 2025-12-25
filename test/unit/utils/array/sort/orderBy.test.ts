import { orderBy } from '../../../../../src/utils/array/sort/orderBy';

describe('orderBy utility function', () => {
  it('should sort array by multiple fields', () => {
    interface Person {
      name: string;
      age: number;
      department: string;
    }

    const people: Person[] = [
      { name: 'John', age: 30, department: 'IT' },
      { name: 'Jane', age: 25, department: 'HR' },
      { name: 'Bob', age: 30, department: 'IT' },
      { name: 'Alice', age: 25, department: 'IT' },
    ];

    // Sort by age (asc) then by name (asc)
    const result = orderBy(people, [
      { key: 'age', order: 'asc' },
      { key: 'name', order: 'asc' },
    ]);

    expect(result).toEqual([
      { name: 'Alice', age: 25, department: 'IT' },
      { name: 'Jane', age: 25, department: 'HR' },
      { name: 'Bob', age: 30, department: 'IT' },
      { name: 'John', age: 30, department: 'IT' },
    ]);
  });

  it('should sort array by multiple fields with different orders', () => {
    interface Person {
      name: string;
      age: number;
      department: string;
    }

    const people: Person[] = [
      { name: 'John', age: 30, department: 'IT' },
      { name: 'Jane', age: 25, department: 'HR' },
      { name: 'Bob', age: 30, department: 'IT' },
      { name: 'Alice', age: 25, department: 'IT' },
    ];

    // Sort by age (asc) then by name (desc)
    const result = orderBy(people, [
      { key: 'age', order: 'asc' },
      { key: 'name', order: 'desc' },
    ]);

    expect(result).toEqual([
      { name: 'Jane', age: 25, department: 'HR' },
      { name: 'Alice', age: 25, department: 'IT' },
      { name: 'John', age: 30, department: 'IT' },
      { name: 'Bob', age: 30, department: 'IT' },
    ]);
  });

  it('should handle empty orders array', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    const result = orderBy(people, []);
    expect(result).toEqual(people); // Should return a copy without sorting
  });

  it('should handle single order condition', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const result = orderBy(people, [{ key: 'age', order: 'desc' }]);
    expect(result).toEqual([
      { name: 'Bob', age: 35 },
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]);
  });

  it('should handle keySelector function', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 25 },
    ];

    // Sort by name length (asc) then by age (desc)
    const result = orderBy(people, [
      { keySelector: (person: Person) => person.name.length, order: 'asc' },
      { key: 'age', order: 'desc' },
    ]);

    expect(result).toEqual([
      { name: 'Bob', age: 30 }, // Bob: length 3, age 30
      { name: 'John', age: 30 }, // John: length 4, age 30
      { name: 'Jane', age: 25 }, // Jane: length 4, age 25
      { name: 'Alice', age: 25 }, // Alice: length 5, age 25
    ]);
  });

  it('should throw error when order condition has neither key nor keySelector', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    expect(() => {
      orderBy(people, [{} as any]);
    }).toThrow("Order condition at index 0 must have either 'key' or 'keySelector'");
  });

  it('should throw error when order condition has both key and keySelector', () => {
    interface Person {
      name: string;
      age: number;
    }

    const people: Person[] = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    expect(() => {
      orderBy(people, [
        { key: 'age', keySelector: (person: Person) => person.name } as any,
      ]);
    }).toThrow("Order condition at index 0 cannot have both 'key' and 'keySelector'");
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
    const result = orderBy(original, [{ key: 'age', order: 'asc' }]);

    expect(original).toEqual(originalCopy);
    expect(result).not.toBe(original);
  });
});