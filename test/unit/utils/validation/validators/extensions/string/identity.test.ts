import {
    validateEmail,
    validatePhone,
    validateUsername,
    validateUUID,
    validateCreditCard,
    validateChineseID,
    validateChinesePostcode,
    ValidationErrorContext,
    StringExtensionRuleOptions,
} from '@/utils';

describe('身份验证函数测试', () => {
    describe('validateEmail', () => {
        it('当值为有效的邮箱地址时验证通过', () => {
            const value = 'test@example.com';
            const rule: StringExtensionRuleOptions = {};

            const result = validateEmail(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为带子域名的邮箱地址时验证通过', () => {
            const value = 'user.name+tag@subdomain.example.co.uk';
            const rule: StringExtensionRuleOptions = {};

            const result = validateEmail(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的邮箱地址时返回错误', () => {
            const value = 'invalid-email';
            const rule: StringExtensionRuleOptions = {};

            const result = validateEmail(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值缺少@符号时返回错误', () => {
            const value = 'testexample.com';
            const rule: StringExtensionRuleOptions = {};

            const result = validateEmail(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时验证通过（跳过验证）', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateEmail(value, rule, {});

            expect(result).toBeNull();
        });
    });

    describe('validatePhone', () => {
        it('当值为有效的电话号码时验证通过', () => {
            const value = '+1234567890';
            const rule: StringExtensionRuleOptions = {};

            const result = validatePhone(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为无+号的电话号码时验证通过', () => {
            const value = '1234567890';
            const rule: StringExtensionRuleOptions = {};

            const result = validatePhone(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的电话号码时返回错误', () => {
            const value = 'invalid-phone';
            const rule: StringExtensionRuleOptions = {};

            const result = validatePhone(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值包含非数字字符（除+外）时返回错误', () => {
            const value = '+123abc456';
            const rule: StringExtensionRuleOptions = {};

            const result = validatePhone(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });
    });

    describe('validateUsername', () => {
        it('当值为有效的用户名时验证通过', () => {
            const value = 'username123';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUsername(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值包含下划线和连字符时验证通过', () => {
            const value = 'user_name-test';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUsername(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值长度在3-20之间时验证通过', () => {
            const value = 'usr';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUsername(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的用户名时返回错误', () => {
            const value = 'us'; // 太短
            const rule: StringExtensionRuleOptions = {};

            const result = validateUsername(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值包含无效字符时返回错误', () => {
            const value = 'user@name';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUsername(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });
    });

    describe('validateUUID', () => {
        it('当值为有效的UUID时验证通过', () => {
            const value = '550e8400-e29b-41d4-a716-446655440000';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUUID(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为不同格式的UUID时验证通过', () => {
            const value = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUUID(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的UUID时返回错误', () => {
            const value = 'invalid-uuid';
            const rule: StringExtensionRuleOptions = {};

            const result = validateUUID(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值格式不正确时返回错误', () => {
            const value = '550e8400-e29b-41d4-a716'; // 不完整
            const rule: StringExtensionRuleOptions = {};

            const result = validateUUID(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });
    });

    describe('validateCreditCard', () => {
        it('当值为有效的信用卡号时验证通过', () => {
            const value = '1234567890123456';
            const rule: StringExtensionRuleOptions = {};

            const result = validateCreditCard(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值包含分隔符时验证通过', () => {
            const value = '1234-5678-9012-3456';
            const rule: StringExtensionRuleOptions = {};

            const result = validateCreditCard(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值包含空格分隔符时验证通过', () => {
            const value = '1234 5678 9012 3456';
            const rule: StringExtensionRuleOptions = {};

            const result = validateCreditCard(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的信用卡号时返回错误', () => {
            const value = 'invalid-card';
            const rule: StringExtensionRuleOptions = {};

            const result = validateCreditCard(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值长度不正确时返回错误', () => {
            const value = '123456'; // 太短
            const rule: StringExtensionRuleOptions = {};

            const result = validateCreditCard(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });
    });

    describe('validateChineseID', () => {
        it('当值为有效的15位中国身份证号时验证通过', () => {
            const value = '110101199001011234';
            const rule: StringExtensionRuleOptions = {};

            const result = validateChineseID(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的18位中国身份证号时验证通过', () => {
            const value = '11010119900101123X';
            const rule: StringExtensionRuleOptions = {};

            const result = validateChineseID(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的中国身份证号时返回错误', () => {
            const value = 'invalid-id';
            const rule: StringExtensionRuleOptions = {};

            const result = validateChineseID(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值长度不正确时返回错误', () => {
            const value = '12345'; // 太短
            const rule: StringExtensionRuleOptions = {};

            const result = validateChineseID(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });
    });

    describe('validateChinesePostcode', () => {
        it('当值为有效的中国邮政编码时验证通过', () => {
            const value = '100000';
            const rule: StringExtensionRuleOptions = {};

            const result = validateChinesePostcode(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为另一个有效的中国邮政编码时验证通过', () => {
            const value = '200000';
            const rule: StringExtensionRuleOptions = {};

            const result = validateChinesePostcode(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是有效的中国邮政编码时返回错误', () => {
            const value = '000000'; // 以0开头，无效
            const rule: StringExtensionRuleOptions = {};

            const result = validateChinesePostcode(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值长度不正确时返回错误', () => {
            const value = '12345'; // 太短
            const rule: StringExtensionRuleOptions = {};

            const result = validateChinesePostcode(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('应该正确传递上下文信息', () => {
            const value = 'invalid-postcode';
            const rule: StringExtensionRuleOptions = {};
            const context: ValidationErrorContext = {
                field: 'testField',
                value,
            };

            const result = validateChinesePostcode(value, rule, context);

            expect(result).not.toBeNull();
            if (result && result[0] && result[0].context) {
                expect(result[0].context.field).toBe('testField');
            }
        });
    });
});
