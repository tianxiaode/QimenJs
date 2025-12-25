import { validateStringByPresetPattern } from '@/validation/validators/extensions/string/pattern';
import { ValidationPatternType, ValidationErrorContext, StringExtensionRuleOptions, ValidationErrorCode } from '@/validation';

describe('validateStringByPresetPattern函数测试', () => {
    it('当使用EMAIL模式且输入有效邮箱时验证通过', () => {
        const value = 'test@example.com';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.EMAIL;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).toBeNull();
    });

    it('当使用EMAIL模式且输入无效邮箱时返回错误', () => {
        const value = 'invalid-email';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.EMAIL;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当使用URL模式且输入有效URL时验证通过', () => {
        const value = 'https://www.example.com';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.URL;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).toBeNull();
    });

    it('当使用URL模式且输入无效URL时返回错误', () => {
        const value = 'not-a-url';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.URL;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当使用IPV4模式且输入有效IPV4地址时验证通过', () => {
        const value = '192.168.1.1';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.IPV4;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).toBeNull();
    });

    it('当使用IPV4模式且输入无效IPV4地址时返回错误', () => {
        const value = '999.999.999.999';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.IPV4;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当使用PHONE模式且输入有效电话号码时验证通过', () => {
        const value = '+1234567890';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.PHONE;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).toBeNull();
    });

    it('当使用PHONE模式且输入无效电话号码时返回错误', () => {
        const value = 'invalid-phone';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.PHONE;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当使用UUID模式且输入有效UUID时验证通过', () => {
        const value = '550e8400-e29b-41d4-a716-446655440000';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.UUID;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).toBeNull();
    });

    it('当使用UUID模式且输入无效UUID时返回错误', () => {
        const value = 'invalid-uuid';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.UUID;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当输入为null时返回错误', () => {
        const value = null;
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.EMAIL;

        // @ts-ignore - 测试 null 值
        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为undefined时返回错误', () => {
        const value = undefined;
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.EMAIL;

        // @ts-ignore - 测试 undefined 值
        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当输入为非字符串类型时返回类型错误', () => {
        const value = 123;
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.EMAIL;

        // @ts-ignore - 测试非字符串值
        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当使用自定义长度规则时应同时应用长度和模式验证', () => {
        const value = 'a@b.co'; // 有效的邮箱，但长度小于6
        const rule: StringExtensionRuleOptions = {
            minLength: 10, // 长度要求
        };
        const patternType = ValidationPatternType.EMAIL;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            // 应该返回长度错误，因为长度验证优先级更高
            expect(result[0].code).toBe('VALIDATION_TOO_SMALL');
        }
    });

    it('当使用模式验证时正确传递上下文信息', () => {
        const value = 'invalid-email';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.EMAIL;
        const context: ValidationErrorContext = {
            field: 'emailField',
            value,
        };

        const result = validateStringByPresetPattern(value, rule, patternType, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('emailField');
            expect(result[0].context.value).toBe('invalid-email');
        }
    });

    it('当使用UPPERCASE模式且输入包含大写字母时验证通过', () => {
        const value = 'ABC';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.UPPERCASE;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).toBeNull();
    });

    it('当使用UPPERCASE模式且输入不包含大写字母时返回错误', () => {
        const value = 'abc';
        const rule: StringExtensionRuleOptions = {};
        const patternType = ValidationPatternType.UPPERCASE;

        const result = validateStringByPresetPattern(value, rule, patternType, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });
});