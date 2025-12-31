import xxhash64 from '@/crypto/xxhash64';

describe('XXHASH64 Algorithm Test', () => {
  it('should return correct hash for empty string with default seed', () => {
    expect(xxhash64('')).toBe('000000003066b473');
  });

  it('should return correct hash for simple string with default seed', () => {
    expect(xxhash64('hello')).toBe('000000004d01e2f6');
  });

  it('should return correct hash for longer string with default seed', () => {
    expect(xxhash64('The quick brown fox jumps over the lazy dog')).toBe('00000000772c8709');
  });

  it('should return correct hash for string with special characters', () => {
    expect(xxhash64('Hello, 世界!')).toBe('00000000305c2b43');
  });

  it('should return correct hash for numeric string', () => {
    expect(xxhash64('123456')).toBe('00000000a343f5ae');
  });

  it('should return correct hash for string with spaces', () => {
    expect(xxhash64(' hello world ')).toBe('000000007737c58a');
  });

  it('should handle different string lengths correctly', () => {
    expect(xxhash64('a')).toHaveLength(16); // XXHASH64 always returns 16 hex characters
    expect(xxhash64('ab')).toHaveLength(16);
    expect(xxhash64('abc')).toHaveLength(16);
    expect(xxhash64('a'.repeat(1000))).toHaveLength(16);
  });

  it('should return consistent results for same input', () => {
    const input = 'consistent test string';
    const hash1 = xxhash64(input);
    const hash2 = xxhash64(input);
    expect(hash1).toBe(hash2);
  });

  it('should return different hash with different seeds', () => {
    const input = 'test string';
    const hashWithDefaultSeed = xxhash64(input);
    const hashWithSeed0 = xxhash64(input, 0);
    const hashWithSeed1 = xxhash64(input, 1);
    
    expect(hashWithDefaultSeed).toBe(hashWithSeed0);
    expect(hashWithSeed0).not.toBe(hashWithSeed1);
  });

  it('should handle different seed values', () => {
    const input = 'test string';
    
    // Test various seed values
    expect(xxhash64(input, 0)).toHaveLength(16);
    expect(xxhash64(input, 12345)).toHaveLength(16);
    expect(xxhash64(input, 0xFFFFFFFF)).toHaveLength(16);
    expect(xxhash64(input, -1)).toHaveLength(16);
  });

  it('should throw TypeError for non-string input', () => {
    expect(() => {
      // @ts-ignore - Testing invalid input
      xxhash64(123);
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - Testing invalid input
      xxhash64(null);
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - Testing invalid input
      xxhash64(undefined);
    }).toThrow(TypeError);
  });

  it('should handle very long strings without errors', () => {
    const longString = 'a'.repeat(10000);
    const hash = xxhash64(longString);
    expect(hash).toHaveLength(16);
    expect(hash).toMatch(/^[a-f0-9]+$/); // Should be a valid hex string
  });

  it('should handle extreme seed values', () => {
    const input = 'test';
    // Test with very large and very small seed values
    expect(xxhash64(input, Number.MAX_SAFE_INTEGER)).toHaveLength(16);
    expect(xxhash64(input, Number.MIN_SAFE_INTEGER)).toHaveLength(16);
    expect(xxhash64(input, 0)).toHaveLength(16);
  });
});