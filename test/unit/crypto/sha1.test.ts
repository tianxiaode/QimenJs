import sha1 from '@/crypto/sha1';

describe('SHA-1 Algorithm Test', () => {
  it('should return correct hash for empty string', () => {
    expect(sha1('')).toBe('968eedfdb783781a11678a6d121580156855debf');
  });

  it('should return correct hash for simple string', () => {
    expect(sha1('hello')).toBe('f1baddb1932b2855412c4c66d75359cc8f588ca3');
  });

  it('should return correct hash for longer string', () => {
    expect(sha1('The quick brown fox jumps over the lazy dog')).toBe('822b91c8b5d0947b4c52334f4700c2782ddd7479');
  });

  it('should return correct hash for string with special characters', () => {
    expect(sha1('Hello, 世界!')).toBe('51a421458ccfed33693bf9f0745e1b972d97ed80');
  });

  it('should return correct hash for numeric string', () => {
    expect(sha1('123456')).toBe('891de75a653234c9404077744c5ea14bcdc02bd3');
  });

  it('should return correct hash for string with spaces', () => {
    expect(sha1(' hello world ')).toBe('d2b26c64328ac7a492445303cf71584ccfa562ff');
  });

  it('should handle different string lengths correctly', () => {
    expect(sha1('a')).toHaveLength(40); // SHA-1 always returns 40 hex characters
    expect(sha1('ab')).toHaveLength(40);
    expect(sha1('abc')).toHaveLength(40);
    expect(sha1('a'.repeat(1000))).toHaveLength(40);
  });

  it('should return consistent results for same input', () => {
    const input = 'consistent test string';
    const hash1 = sha1(input);
    const hash2 = sha1(input);
    expect(hash1).toBe(hash2);
  });

  it('should throw TypeError for non-string input', () => {
    expect(() => {
      // @ts-ignore - Testing invalid input
      sha1(123);
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - Testing invalid input
      sha1(null);
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - Testing invalid input
      sha1(undefined);
    }).toThrow(TypeError);
  });
});