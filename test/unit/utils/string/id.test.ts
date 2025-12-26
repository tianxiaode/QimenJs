import * as idModule from '../../../../src/utils/string/id';

describe('String ID Utility Functions', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('getId', () => {
        it('should generate a unique ID with default prefix', () => {
            const id1 = idModule.getId();
            const id2 = idModule.getId();
            
            // 验证格式
            expect(id1).toMatch(/^id-\d+-\d+$/);
            expect(id2).toMatch(/^id-\d+-\d+$/);
            
            // 验证前缀
            expect(id1.startsWith('id-')).toBe(true);
            expect(id2.startsWith('id-')).toBe(true);
            
            // 验证各部分结构
            const parts1 = id1.split('-');
            const parts2 = id2.split('-');
            expect(parts1).toHaveLength(3); // prefix-timestamp-seed
            expect(parts2).toHaveLength(3); // prefix-timestamp-seed
            expect(Number(parts1[1])).toBeGreaterThan(0); // timestamp should be a number > 0
            expect(Number(parts1[2])).toBeGreaterThan(0); // seed should be a number > 0
            expect(Number(parts2[2])).toBe(Number(parts1[2]) + 1); // seed should increment
        });

        it('should generate a unique ID with custom prefix', () => {
            const id = idModule.getId('test');
            expect(id).toMatch(/^test-\d+-\d+$/);
            
            const parts = id.split('-');
            expect(parts).toHaveLength(3); // prefix-timestamp-seed
            expect(parts[0]).toBe('test');
            expect(Number(parts[1])).toBeGreaterThan(0); // timestamp should be a number > 0
            expect(Number(parts[2])).toBeGreaterThan(0); // seed should be a number > 0
        });

        it('should handle special characters in prefix', () => {
            const id = idModule.getId('user-123');
            // The prefix containing hyphens will be preserved as the first part
            expect(id).toMatch(/^user-123-\d+-\d+$/);
            
            const parts = id.split('-');
            expect(parts).toHaveLength(4); // user-123-timestamp-seed
            expect(parts[0]).toBe('user');
            expect(parts[1]).toBe('123');
            expect(Number(parts[2])).toBeGreaterThan(0); // timestamp should be a number > 0
            expect(Number(parts[3])).toBeGreaterThan(0); // seed should be a number > 0
        });
    });

    describe('generateTraceId', () => {
        it('should generate a 16-byte hexadecimal string', () => {
            const traceId = idModule.generateTraceId();
            expect(traceId).toHaveLength(32); // 16 bytes = 32 hex characters
            expect(traceId).toMatch(/^[0-9a-f]{32}$/);
        });

        it('should generate different IDs on each call', () => {
            const traceId1 = idModule.generateTraceId();
            const traceId2 = idModule.generateTraceId();
            expect(traceId1).not.toBe(traceId2);
        });
    });

    describe('emptyString', () => {
        it('should be a non-breaking space character', () => {
            expect(idModule.emptyString).toBe('\u00A0');
            expect(idModule.emptyString.charCodeAt(0)).toBe(160); // Unicode value for non-breaking space
        });
    });

    describe('normalizedLanguage', () => {
        it('should normalize zh-Hans to zh-CN', () => {
            expect(idModule.normalizedLanguage('zh-Hans')).toBe('zh-CN');
        });

        it('should normalize zh-Hant to zh-TW', () => {
            expect(idModule.normalizedLanguage('zh-Hant')).toBe('zh-TW');
        });

        it('should return other language codes unchanged', () => {
            expect(idModule.normalizedLanguage('en-US')).toBe('en-US');
            expect(idModule.normalizedLanguage('fr-FR')).toBe('fr-FR');
            expect(idModule.normalizedLanguage('zh-CN')).toBe('zh-CN');
            expect(idModule.normalizedLanguage('zh-TW')).toBe('zh-TW');
        });

        it('should handle case sensitive input', () => {
            expect(idModule.normalizedLanguage('Zh-Hans')).toBe('Zh-Hans');
            expect(idModule.normalizedLanguage('ZH-HANT')).toBe('ZH-HANT');
        });
    });
});