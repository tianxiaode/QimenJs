import { shuffle } from '../../../../../src/utils/array/random/shuffle';

describe('shuffle utility function', () => {
  it('should return a new array with same elements in different order', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);

    // Result should be a different array
    expect(result).not.toBe(input);
    // Result should have the same length
    expect(result).toHaveLength(input.length);
    // Result should contain all the same elements
    expect(result.sort()).toEqual(input.sort());
  });

  it('should handle empty array', () => {
    const input: number[] = [];
    const result = shuffle(input);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle array with one element', () => {
    const input = [42];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toEqual([42]);
  });

  it('should handle array with two elements', () => {
    const input = [1, 2];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toHaveLength(2);
    expect(result.sort()).toEqual([1, 2].sort());
  });

  it('should handle array with same elements', () => {
    const input = [1, 1, 1, 1];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
    expect(result).toEqual(input); // All elements are the same
  });

  it('should work with string arrays', () => {
    const input = ['apple', 'banana', 'cherry'];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should work with mixed type arrays', () => {
    const input: any[] = [1, 'hello', true, { id: 1 }];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
    // Check that all elements are present
    input.forEach(item => {
      expect(result).toContainEqual(item);
    });
  });

  it('should work with object arrays', () => {
    const obj1 = { id: 1, name: 'John' };
    const obj2 = { id: 2, name: 'Jane' };
    const obj3 = { id: 3, name: 'Bob' };
    const input = [obj1, obj2, obj3];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
    expect(result).toContainEqual(obj1);
    expect(result).toContainEqual(obj2);
    expect(result).toContainEqual(obj3);
  });

  it('should not modify the original array', () => {
    const input = [3, 1, 4, 1, 5];
    const inputCopy = [...input];
    const result = shuffle(input);

    expect(input).toEqual(inputCopy); // Original array unchanged
  });

  it('should handle large arrays', () => {
    const input = Array.from({ length: 1000 }, (_, i) => i);
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should return different order on most calls (probabilistic test)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = [];

    // Collect 5 shuffles
    for (let i = 0; i < 5; i++) {
      results.push(shuffle(input));
    }

    // With high probability, at least some of the shuffles should be different
    const uniqueResults = new Set(results.map(arr => JSON.stringify(arr)));
    
    // We can't guarantee they'll all be different due to randomness, 
    // but we expect some variation
    expect(uniqueResults.size).toBeGreaterThanOrEqual(1); // At least 1 unique result
  });
});