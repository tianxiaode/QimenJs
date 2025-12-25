import { 
    getId, 
    emptyString, 
    normalizedLanguage 
} from '../../../../src/utils/string/id';

describe('String ID Utility Functions', () => {
    describe('getId', () => {
        it('should generate a unique ID with default prefix', () => {
            const id1 = getId();
            const id2 = getId();
            expect(id1).toBe('id-0');
            expect(id2).toBe('id-1');
        });

        it('should generate a unique ID with custom prefix', () => {
            const id = getId('test');
            expect(id).toBe('test-2'); // Using the next available seed after previous tests
        });

        it('should throw an error if prefix is not a string', () => {
            expect(() => {
                getId(123 as any);
            }).toThrow('Prefix must be a string');
        });

        it('should handle special characters in prefix', () => {
            const id = getId('user-123');
            expect(id).toBe('user-123-3'); // Using the next available seed
        });
    });

    describe('emptyString', () => {
        it('should be a non-breaking space character', () => {
            expect(emptyString).toBe('\u00A0');
            expect(emptyString.charCodeAt(0)).toBe(160); // Unicode value for non-breaking space
        });
    });

    describe('normalizedLanguage', () => {
        it('should normalize zh-Hans to zh-CN', () => {
            expect(normalizedLanguage('zh-Hans')).toBe('zh-CN');
        });

        it('should normalize zh-Hant to zh-TW', () => {
            expect(normalizedLanguage('zh-Hant')).toBe('zh-TW');
        });

        it('should return other language codes unchanged', () => {
            expect(normalizedLanguage('en-US')).toBe('en-US');
            expect(normalizedLanguage('fr-FR')).toBe('fr-FR');
            expect(normalizedLanguage('zh-CN')).toBe('zh-CN');
            expect(normalizedLanguage('zh-TW')).toBe('zh-TW');
        });

        it('should handle case sensitive input', () => {
            expect(normalizedLanguage('Zh-Hans')).toBe('Zh-Hans');
            expect(normalizedLanguage('ZH-HANT')).toBe('ZH-HANT');
        });
    });
});