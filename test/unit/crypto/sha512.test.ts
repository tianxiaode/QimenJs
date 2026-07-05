import sha512 from '@/crypto/sha512';

describe('SHA-512 Algorithm Test', () => {
    it('should return correct hash for empty string', () => {
        expect(sha512('')).toBe(
            '63a20555861ab502e7e64562927652f8ccf893fbc997e92411e885eae6ad96bc9043a5d03ef6b4b20a292ac5e6be808f69505b23e4e78b482ca9feea48a12170'
        );
    });

    it('should return correct hash for simple string', () => {
        expect(sha512('hello')).toBe(
            '7c4e008fa8e851de3ae8e90bb4148caabd67c8b3293569be4eba076abb0eb09b7c8958a61c265422a571e7c4437d6e4e25c1760737890742d124cca8d0841995'
        );
    });

    it('should return correct hash for longer string', () => {
        expect(sha512('The quick brown fox jumps over the lazy dog')).toBe(
            '160d654b0ffae5a0d8aca20e91f93c74ffb1ccfdd35cf2c31a979143ae4b339f795d1345474add0ad7cb7dfbe0ef9a6ff8e2da079b2820919c7e329e090ac4eb'
        );
    });

    it('should return correct hash for string with special characters', () => {
        expect(sha512('Hello, 世界!')).toBe(
            '40a802b2d85360a4f7ae1dab4faba6b4f0350dd9c118af1d3701799cea597e891e8aa776077a5d5f911f266aee0d14322cadc36da1df4850f0a4e44186e475ff'
        );
    });

    it('should return correct hash for numeric string', () => {
        expect(sha512('123456')).toBe(
            'c8efdb1766e06f27395e19b11ce3d6cafc1c1f1fc38eb87a487d16b3d5d538b145f5fa3042511d222841e090c7e3579c887e56bf3c50412b63093b67247f7460'
        );
    });

    it('should return correct hash for string with spaces', () => {
        expect(sha512(' hello world ')).toBe(
            '2b43bd27e40514f27fe094e16faf9ad12c6bd7074ac6d0e9ae9e1e6a1f3b0bf2c30bdbd2a458695deab4f7275013645144340b45ddc0b817d1cdd06a714267c3'
        );
    });

    it('should handle different string lengths correctly', () => {
        expect(sha512('a')).toHaveLength(128); // SHA-512 always returns 128 hex characters
        expect(sha512('ab')).toHaveLength(128);
        expect(sha512('abc')).toHaveLength(128);
        expect(sha512('a'.repeat(1000))).toHaveLength(128);
    });

    it('should return consistent results for same input', () => {
        const input = 'consistent test string';
        const hash1 = sha512(input);
        const hash2 = sha512(input);
        expect(hash1).toBe(hash2);
    });

    it('should throw TypeError for non-string input', () => {
        expect(() => {
            // @ts-ignore - Testing invalid input
            sha512(123);
        }).toThrow(TypeError);

        expect(() => {
            // @ts-ignore - Testing invalid input
            sha512(null);
        }).toThrow(TypeError);

        expect(() => {
            // @ts-ignore - Testing invalid input
            sha512(undefined);
        }).toThrow(TypeError);
    });

    it('should handle very long strings without errors', () => {
        const longString = 'a'.repeat(10000);
        const hash = sha512(longString);
        expect(hash).toHaveLength(128);
        expect(hash).toMatch(/^[a-f0-9]+$/); // Should be a valid hex string
    });
});
