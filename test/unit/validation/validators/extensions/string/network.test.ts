import {
    validateUrl,
    validateIPv4,
    validateIPv6,
    validateMacAddress,
    ValidationErrorContext,
    StringExtensionRuleOptions,
    ValidationErrorCode,
} from '@/validation';

describe('网络格式验证函数测试', () => {
    describe('validateUrl', () => {
        it('当值为有效的HTTP URL时验证通过', () => {
            const value = 'http://example.com';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUrl(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的HTTPS URL时验证通过', () => {
            const value = 'https://www.example.com/path?query=value';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUrl(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的FTP URL时验证通过', () => {
            const value = 'ftp://files.example.com';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUrl(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的URL格式时返回错误', () => {
            const value = 'not-a-url';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUrl(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值缺少协议时返回错误', () => {
            const value = 'example.com';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUrl(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时返回错误', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateUrl(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当值为undefined时返回错误', () => {
            const value = undefined;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 undefined 值
            const result = validateUrl(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_REQUIRED');
            }
        });
    });

    describe('validateIPv4', () => {
        it('当值为有效的IPv4地址时验证通过', () => {
            const value = '192.168.1.1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv4(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为localhost IPv4地址时验证通过', () => {
            const value = '127.0.0.1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv4(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为广播IPv4地址时验证通过', () => {
            const value = '255.255.255.255';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv4(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的IPv4地址时返回错误', () => {
            const value = '999.168.1.1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv4(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值包含无效的IPv4段时返回错误', () => {
            const value = '192.168.256.1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv4(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值格式不正确时返回错误', () => {
            const value = '192.168.1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv4(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时返回错误', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateIPv4(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当值为undefined时返回错误', () => {
            const value = undefined;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 undefined 值
            const result = validateIPv4(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_REQUIRED');
            }
        });
    });

    describe('validateIPv6', () => {
        it('当值为有效的完整IPv6地址时验证通过', () => {
            const value = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv6(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为压缩格式的IPv6地址时验证通过', () => {
            const value = '2001:db8::1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv6(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为localhost的IPv6地址时验证通过', () => {
            const value = '::1';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv6(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的IPv6地址时返回错误', () => {
            const value = 'invalid::ipv6::address';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv6(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值格式不正确时返回错误', () => {
            const value = '2001:0db8:85a3::8a2e:0370:7334:extra';
            const rule: StringExtensionRuleOptions = {};

            const result = validateIPv6(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时返回错误', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateIPv6(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当值为undefined时返回错误', () => {
            const value = undefined;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 undefined 值
            const result = validateIPv6(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_REQUIRED');
            }
        });
    });

    describe('validateMacAddress', () => {
        it('当值为有效的MAC地址（使用冒号分隔）时验证通过', () => {
            const value = '01:23:45:67:89:AB';
            const rule: StringExtensionRuleOptions = {};

            const result = validateMacAddress(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的MAC地址（使用连字符分隔）时验证通过', () => {
            const value = '01-23-45-67-89-AB';
            const rule: StringExtensionRuleOptions = {};

            const result = validateMacAddress(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为另一种格式的MAC地址时验证通过', () => {
            const value = '01:23:45:67:89:ab'; // 小写字母
            const rule: StringExtensionRuleOptions = {};

            const result = validateMacAddress(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的MAC地址时返回错误', () => {
            const value = 'invalid-mac';
            const rule: StringExtensionRuleOptions = {};

            const result = validateMacAddress(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值格式不正确时返回错误', () => {
            const value = '01:23:45:67:89'; // 少一个段
            const rule: StringExtensionRuleOptions = {};

            const result = validateMacAddress(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时返回错误', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateMacAddress(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            }
        });

        it('当值为undefined时返回错误', () => {
            const value = undefined;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 undefined 值
            const result = validateMacAddress(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_REQUIRED');
            }
        });

        it('应该正确传递上下文信息', () => {
            const value = 'invalid-mac';
            const rule: StringExtensionRuleOptions = {};
            const context: ValidationErrorContext = {
                field: 'testField',
                value,
            };

            const result = validateMacAddress(value, rule, context);

            expect(result).not.toBeNull();
            if (result && result[0] && result[0].context) {
                expect(result[0].context.field).toBe('testField');
            }
        });
    });
});