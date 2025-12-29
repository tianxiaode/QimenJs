import { findItem } from '@/utils/array/search/find';

describe('findItem utility function', () => {
  it('should find an item by field and value', () => {
    interface Person {
      id: number;
      name: string;
      age: number;
    }

    const people: Person[] = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ];

    const result = findItem(people, 'name', 'Bob');
    expect(result).toEqual({ id: 2, name: 'Bob', age: 30 });
  });

  it('should return undefined when item is not found', () => {
    interface Person {
      id: number;
      name: string;
      age: number;
    }

    const people: Person[] = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ];

    const result = findItem(people, 'name', 'David');
    expect(result).toBeUndefined();
  });

  it('should handle empty array', () => {
    interface Person {
      id: number;
      name: string;
      age: number;
    }

    const people: Person[] = [];
    const result = findItem(people, 'name', 'Bob');
    expect(result).toBeUndefined();
  });

  it('should find item by numeric field', () => {
    interface Person {
      id: number;
      name: string;
      age: number;
    }

    const people: Person[] = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ];

    const result = findItem(people, 'id', 2);
    expect(result).toEqual({ id: 2, name: 'Bob', age: 30 });
  });

  it('should find item by boolean field', () => {
    interface Item {
      id: number;
      name: string;
      isActive: boolean;
    }

    const items: Item[] = [
      { id: 1, name: 'Item 1', isActive: true },
      { id: 2, name: 'Item 2', isActive: false },
      { id: 3, name: 'Item 3', isActive: true },
    ];

    const result = findItem(items, 'isActive', false);
    expect(result).toEqual({ id: 2, name: 'Item 2', isActive: false });
  });

  it('should find item by field with duplicate values', () => {
    interface Person {
      id: number;
      name: string;
      department: string;
    }

    const people: Person[] = [
      { id: 1, name: 'Alice', department: 'Engineering' },
      { id: 2, name: 'Bob', department: 'Marketing' },
      { id: 3, name: 'Charlie', department: 'Engineering' },
    ];

    const result = findItem(people, 'department', 'Engineering');
    // Should return the first match
    expect(result).toEqual({ id: 1, name: 'Alice', department: 'Engineering' });
  });

  it('should handle NaN values correctly', () => {
    interface Data {
      id: number;
      value: number;
    }

    const data: Data[] = [
      { id: 1, value: 10 },
      { id: 2, value: NaN },
      { id: 3, value: 20 },
    ];

    const result = findItem(data, 'value', NaN);
    expect(result).toEqual({ id: 2, value: NaN });
  });

  it('should handle string fields', () => {
    interface Product {
      id: number;
      name: string;
      category: string;
    }

    const products: Product[] = [
      { id: 1, name: 'Laptop', category: 'Electronics' },
      { id: 2, name: 'Book', category: 'Education' },
      { id: 3, name: 'Phone', category: 'Electronics' },
    ];

    const result = findItem(products, 'category', 'Education');
    expect(result).toEqual({ id: 2, name: 'Book', category: 'Education' });
  });

  it('should work with objects containing special values', () => {
    interface TestObj {
      id: number;
      value: any;
    }

    const objects: TestObj[] = [
      { id: 1, value: null },
      { id: 2, value: undefined },
      { id: 3, value: '' },
      { id: 4, value: 0 },
    ];

    expect(findItem(objects, 'value', null)).toEqual({ id: 1, value: null });
    expect(findItem(objects, 'value', undefined)).toEqual({ id: 2, value: undefined });
    expect(findItem(objects, 'value', '')).toEqual({ id: 3, value: '' });
    expect(findItem(objects, 'value', 0)).toEqual({ id: 4, value: 0 });
  });

  it('should find items with symbol keys', () => {
    const sym1 = Symbol('sym1');
    const sym2 = Symbol('sym2');
    const sym3 = Symbol('sym3');

    interface WithSymbol {
      id: number;
      [sym1]: string;
      [sym2]: number;
      [sym3]: boolean;
    }

    const items: WithSymbol[] = [
      { id: 1, [sym1]: 'first', [sym2]: 100, [sym3]: true },
      { id: 2, [sym1]: 'second', [sym2]: 200, [sym3]: false },
      { id: 3, [sym1]: 'third', [sym2]: 300, [sym3]: true },
    ];

    // Find by symbol property
    const result1 = findItem(items, sym1, 'second');
    expect(result1).toEqual({ id: 2, [sym1]: 'second', [sym2]: 200, [sym3]: false });

    const result2 = findItem(items, sym2, 300);
    expect(result2).toEqual({ id: 3, [sym1]: 'third', [sym2]: 300, [sym3]: true });
  });
});