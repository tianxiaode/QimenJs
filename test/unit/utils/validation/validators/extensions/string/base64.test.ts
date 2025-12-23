import { validateBase64, ValidationErrorContext, StringExtensionRuleOptions } from '@/utils';

describe('validateBase64', () => {
    it('当值为有效的Base64编码时验证通过', () => {
        const value = 'SGVsbG8gV29ybGQ=';
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为有效的Base64编码（无填充）时验证通过', () => {
        const value = 'YWJjZGVm';
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为有效的Base64编码（有填充）时验证通过', () => {
        const value = 'YWJjZA==';
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为空字符串时验证通过', () => {
        const value = '';
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为有效的Base64编码（包含数字）时验证通过', () => {
        const value = 'MTIzNDU2';
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值不是有效的Base64编码时返回错误', () => {
        const value = 'Invalid#Base64';
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当值缺少必要填充时返回错误', () => {
        const value = 'SGVsbG8gV29ybGQ'; // 'Hello World' without padding
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当值包含无效Base64字符时返回错误', () => {
        const value = 'SGVs!sbG8='; // contains invalid character '!'
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当值为null时验证通过（跳过验证）', () => {
        const value = null;
        const rule: StringExtensionRuleOptions = {};

        // @ts-ignore - 测试 null 值
        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为undefined时验证通过（跳过验证）', () => {
        const value = undefined;
        const rule: StringExtensionRuleOptions = {};

        // @ts-ignore - 测试 undefined 值
        const result = validateBase64(value, rule, {});

        expect(result).toBeNull();
    });

    it('应该正确传递上下文信息', () => {
        const value = 'Invalid#Base64';
        const rule: StringExtensionRuleOptions = {};
        const context: ValidationErrorContext = {
            field: 'testField',
            value,
        };

        const result = validateBase64(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });

    it('当值包含Base64字符集外的字符时返回错误', () => {
        const value = 'SGVsbCB-W123'; // 包含'-'和'_'字符
        const rule: StringExtensionRuleOptions = {};

        const result = validateBase64(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });
});
