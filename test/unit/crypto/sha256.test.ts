import sha256 from '@/crypto/sha256';

describe('SHA-256 Algorithm Test', () => {
    it('should return correct hash for empty string', () => {
        expect(sha256('')).toBe('da5698be17b9b46962335799779fbeca8ce5d491c0d26243bafef9ea1837a9d8');
    });

    it('should return correct hash for simple string', () => {
        expect(sha256('hello')).toBe(
            'da97b9be9a6b5692611fd024fd6b0e03b73c0be0151427fcf4c8aa954245b21c'
        );
    });

    it('should return correct hash for longer string', () => {
        expect(sha256('The quick brown fox jumps over the lazy dog')).toBe(
            'df62f89994b5fc383d568a7a9dadd432ef20d3b39c9cc1fd71e7ee36a4ca4dce'
        );
    });

    it('should return correct hash for string with special characters', () => {
        expect(sha256('Hello, 世界!')).toBe(
            '2545b43b4080e7c668a7aa4c1d6e63533ed0f51f888fb5e75b5d8b1397dc8fdd'
        );
    });

    it('should return correct hash for numeric string', () => {
        expect(sha256('123456')).toBe(
            'aef39654e6383383913f7879853798a568bb70549cbb4b6e29953a6f4d6fabbd'
        );
    });

    it('should return correct hash for string with spaces', () => {
        expect(sha256(' hello world ')).toBe(
            'ae26541957c94c84b3665b0601a53803fc06017947ae983b6e238a0d618b3a79'
        );
    });

    it('should handle different string lengths correctly', () => {
        expect(sha256('a')).toHaveLength(64); // SHA-256 always returns 64 hex characters
        expect(sha256('ab')).toHaveLength(64);
        expect(sha256('abc')).toHaveLength(64);
        expect(sha256('a'.repeat(1000))).toHaveLength(64);
    });

    it('should return consistent results for same input', () => {
        const input = 'consistent test string';
        const hash1 = sha256(input);
        const hash2 = sha256(input);
        expect(hash1).toBe(hash2);
    });

    it('should throw TypeError for non-string input', () => {
        expect(() => {
            // @ts-ignore - Testing invalid input
            sha256(123);
        }).toThrow(TypeError);

        expect(() => {
            // @ts-ignore - Testing invalid input
            sha256(null);
        }).toThrow(TypeError);

        expect(() => {
            // @ts-ignore - Testing invalid input
            sha256(undefined);
        }).toThrow(TypeError);
    });
});
