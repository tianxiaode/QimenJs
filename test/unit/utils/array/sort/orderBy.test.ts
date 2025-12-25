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

  it('should sort by date fields in ascending order', () => {
    interface Event {
      name: string;
      date: Date;
    }

    const events: Event[] = [
      { name: 'Event C', date: new Date(2023, 11, 15) }, // Dec 15, 2023
      { name: 'Event A', date: new Date(2023, 0, 15) },  // Jan 15, 2023
      { name: 'Event B', date: new Date(2023, 5, 15) },  // Jun 15, 2023
    ];

    const result = orderBy(events, [{ key: 'date', order: 'asc' }]);
    expect(result).toEqual([
      { name: 'Event A', date: new Date(2023, 0, 15) },
      { name: 'Event B', date: new Date(2023, 5, 15) },
      { name: 'Event C', date: new Date(2023, 11, 15) },
    ]);
  });

  it('should sort by date fields in descending order', () => {
    interface Event {
      name: string;
      date: Date;
    }

    const events: Event[] = [
      { name: 'Event C', date: new Date(2023, 11, 15) }, // Dec 15, 2023
      { name: 'Event A', date: new Date(2023, 0, 15) },  // Jan 15, 2023
      { name: 'Event B', date: new Date(2023, 5, 15) },  // Jun 15, 2023
    ];

    const result = orderBy(events, [{ key: 'date', order: 'desc' }]);
    expect(result).toEqual([
      { name: 'Event C', date: new Date(2023, 11, 15) },
      { name: 'Event B', date: new Date(2023, 5, 15) },
      { name: 'Event A', date: new Date(2023, 0, 15) },
    ]);
  });

  it('should sort by string fields using localeCompare', () => {
    interface Product {
      name: string;
      category: string;
    }

    const products: Product[] = [
      { name: 'Z Product', category: 'B' },
      { name: 'A Product', category: 'C' },
      { name: 'M Product', category: 'A' },
    ];

    const result = orderBy(products, [{ key: 'name', order: 'asc' }]);
    expect(result).toEqual([
      { name: 'A Product', category: 'C' },
      { name: 'M Product', category: 'A' },
      { name: 'Z Product', category: 'B' },
    ]);
  });

  it('should handle multiple sort criteria with different data types', () => {
    interface Item {
      name: string;
      date: Date;
      priority: number;
    }

    const items: Item[] = [
      { name: 'Item C', date: new Date(2023, 5, 15), priority: 1 },
      { name: 'Item A', date: new Date(2023, 5, 15), priority: 2 },
      { name: 'Item B', date: new Date(2023, 0, 15), priority: 1 },
    ];

    // Sort by date (asc) then by name (asc)
    const result = orderBy(items, [
      { key: 'date', order: 'asc' },
      { key: 'name', order: 'asc' },
    ]);

    expect(result).toEqual([
      { name: 'Item B', date: new Date(2023, 0, 15), priority: 1 },
      { name: 'Item A', date: new Date(2023, 5, 15), priority: 2 },
      { name: 'Item C', date: new Date(2023, 5, 15), priority: 1 },
    ]);
  });
});