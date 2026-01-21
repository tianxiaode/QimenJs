import { orderBy } from '@/utils/array/sort/orderBy';

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
      { by: 'age', order: 'asc' },
      { by: 'name', order: 'asc' },
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
      { by: 'age', order: 'asc' },
      { by: 'name', order: 'desc' },
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

    const result = orderBy(people, [{ by: 'age', order: 'desc' }]);
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
      { by: (person: Person) => person.name.length, order: 'asc' },
      { by: 'age', order: 'desc' },
    ]);

    expect(result).toEqual([
      { name: 'Bob', age: 30 }, // Bob: length 3, age 30
      { name: 'John', age: 30 }, // John: length 4, age 30
      { name: 'Jane', age: 25 }, // Jane: length 4, age 25
      { name: 'Alice', age: 25 }, // Alice: length 5, age 25
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
    const result = orderBy(original, [{ by: 'age', order: 'asc' }]);

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

    const result = orderBy(events, [{ by: 'date', order: 'asc' }]);
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

    const result = orderBy(events, [{ by: 'date', order: 'desc' }]);
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

    const result = orderBy(products, [{ by: 'name', order: 'asc' }]);
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
      { by: 'date', order: 'asc' },
      { by: 'name', order: 'asc' },
    ]);

    expect(result).toEqual([
      { name: 'Item B', date: new Date(2023, 0, 15), priority: 1 },
      { name: 'Item A', date: new Date(2023, 5, 15), priority: 2 },
      { name: 'Item C', date: new Date(2023, 5, 15), priority: 1 },
    ]);
  });

  it('should handle null and undefined values properly', () => {
    interface TestItem {
      value: string | null | undefined;
    }

    const items: TestItem[] = [
      { value: 'a' },
      { value: null },
      { value: 'b' },
      { value: undefined },
    ];

    // Ascending order: undefined comes first, then null
    const resultAsc = orderBy(items, [{ by: 'value', order: 'asc' }]);
    expect(resultAsc).toEqual([
      { value: undefined },
      { value: null },
      { value: 'a' },
      { value: 'b' },
    ]);

    // Descending order: values in reverse order, with null and undefined at the end
    const resultDesc = orderBy(items, [{ by: 'value', order: 'desc' }]);
    expect(resultDesc).toEqual([
      { value: 'b' },
      { value: 'a' },
      { value: null },
      { value: undefined },
    ]);
  });

  it('should handle number fields correctly', () => {
    interface Score {
      name: string;
      value: number;
    }

    const scores: Score[] = [
      { name: 'Charlie', value: 75 },
      { name: 'Alice', value: 90 },
      { name: 'Bob', value: 80 },
    ];

    const result = orderBy(scores, [{ by: 'value', order: 'asc' }]);
    expect(result).toEqual([
      { name: 'Charlie', value: 75 },
      { name: 'Bob', value: 80 },
      { name: 'Alice', value: 90 },
    ]);
  });

  it('should use default comparator for boolean values', () => {
    interface TestItem {
      flag: boolean;
    }

    const items: TestItem[] = [
      { flag: true },
      { flag: false },
    ];

    const result = orderBy(items, [{ by: 'flag', order: 'asc' }]);
    expect(result).toEqual([
      { flag: false }, // false comes before true
      { flag: true },
    ]);
  });

  it('should return 0 when all sort conditions are equal', () => {
    interface TestItem {
      prop1: string;
      prop2: number;
    }

    const items: TestItem[] = [
      { prop1: 'same', prop2: 1 },
      { prop1: 'same', prop2: 1 },
      { prop1: 'same', prop2: 1 },
    ];

    // All items are identical according to sort conditions, so order should remain stable
    const result = orderBy(items, [
      { by: 'prop1', order: 'asc' },
      { by: 'prop2', order: 'desc' },
    ]);

    expect(result).toEqual([
      { prop1: 'same', prop2: 1 }, // same order as original
      { prop1: 'same', prop2: 1 },
      { prop1: 'same', prop2: 1 },
    ]);
  });

  it('should handle null vs undefined comparison specifically', () => {
    interface TestItem {
      value: null | undefined;
    }

    const items: TestItem[] = [
      { value: null },
      { value: undefined },
    ];

    const result = orderBy(items, [{ by: 'value', order: 'asc' }]);
    expect(result).toEqual([
      { value: undefined },
      { value: null },
    ]);

    // In descending order
    const resultDesc = orderBy(items, [{ by: 'value', order: 'desc' }]);
    expect(resultDesc).toEqual([
      { value: null },
      { value: undefined },
    ]);
  });

  it('should handle objects with different properties including null and non-null values', () => {
    interface TestItem {
      name: string | null;
    }

    const items: TestItem[] = [
      { name: null },
      { name: 'B' },
      { name: null },
      { name: 'A' },
    ];

    // Ascending order
    const resultAsc = orderBy(items, [{ by: 'name', order: 'asc' }]);
    expect(resultAsc).toEqual([
      { name: null },
      { name: null },
      { name: 'A' },
      { name: 'B' },
    ]);

    // Descending order - this should trigger the desc logic in null handling
    const resultDesc = orderBy(items, [{ by: 'name', order: 'desc' }]);
    expect(resultDesc).toEqual([
      { name: 'B' },
      { name: 'A' },
      { name: null },
      { name: null },
    ]);
  });

  it('should compare objects with different types using default comparator', () => {
    interface TestItem {
      value: any;
    }

    // Testing the default comparator with different types that are not number, date, or string
    const items: TestItem[] = [
      { value: { custom: 'object' } },
      { value: { another: 'object' } },
    ];

    // Using a selector function to ensure we go through the full comparison process
    const result = orderBy(items, [{ by: item => item.value, order: 'asc' }]);
    
    // The actual order doesn't matter as long as the function doesn't crash
    // This ensures the default comparator is used
    expect(result.length).toBe(2);
  });

  it('should handle null and non-null values in descending order specifically', () => {
    interface TestItem {
      value: string | null;
    }

    // Explicitly test the case where we have null vs non-null in descending order
    const items: TestItem[] = [
      { value: 'A' },
      { value: null },
    ];

    // In descending order, non-null value should come first
    const result = orderBy(items, [{ by: 'value', order: 'desc' }]);
    expect(result).toEqual([
      { value: 'A' },
      { value: null },
    ]);
  });
});