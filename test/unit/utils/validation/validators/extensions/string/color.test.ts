import {
    validateHexColor,
    validateRGBColor,
    validateRGBAColor,
    ValidationErrorContext,
    StringExtensionRuleOptions,
} from '@/utils';

describe('颜色验证函数测试', () => {
    describe('validateHexColor', () => {
        it('当值为有效的6位十六进制颜色时验证通过', () => {
            const value = '#ff0000';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的3位十六进制颜色时验证通过', () => {
            const value = '#f00';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为大写十六进制颜色时验证通过', () => {
            const value = '#FF00FF';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为混合大小写十六进制颜色时验证通过', () => {
            const value = '#Ff00Ff';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值不是十六进制颜色格式时返回错误', () => {
            const value = 'invalid_color';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值缺少#前缀时返回错误', () => {
            const value = 'ff0000';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为无效的十六进制字符时返回错误', () => {
            const value = '#gg00gg';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为不正确长度的十六进制时返回错误', () => {
            const value = '#ff00';
            const rule: StringExtensionRuleOptions = {};

            const result = validateHexColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时验证通过（跳过验证）', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateHexColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为undefined时验证通过（跳过验证）', () => {
            const value = undefined;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 undefined 值
            const result = validateHexColor(value, rule, {});

            expect(result).toBeNull();
        });
    });

    describe('validateRGBColor', () => {
        it('当值为有效的rgb颜色格式时验证通过', () => {
            const value = 'rgb(255, 0, 0)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的rgb颜色格式（带空格）时验证通过', () => {
            const value = 'rgb( 255 , 0 , 0 )';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的rgb颜色格式（不同数值）时验证通过', () => {
            const value = 'rgb(128, 200, 64)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当rgb值超出范围时返回错误', () => {
            const value = 'rgb(300, 0, 0)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当rgb值为负数时返回错误', () => {
            const value = 'rgb(-10, 0, 0)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当格式不正确时返回错误', () => {
            const value = 'rgb(255, 0)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当缺少rgb前缀时返回错误', () => {
            const value = '255, 0, 0';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时验证通过（跳过验证）', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateRGBColor(value, rule, {});

            expect(result).toBeNull();
        });
    });

    describe('validateRGBAColor', () => {
        it('当值为有效的rgba颜色格式时验证通过', () => {
            const value = 'rgba(255, 0, 0, 0.5)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当值为有效的rgba颜色格式（带空格）时验证通过', () => {
            const value = 'rgba( 255 , 0 , 0 , 0.8 )';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当alpha值为0或1时验证通过', () => {
            const value = 'rgba(100, 150, 200, 1)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当alpha值为0.x格式时验证通过', () => {
            const value = 'rgba(100, 150, 200, 0.5)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('当rgba值超出范围时返回错误', () => {
            const value = 'rgba(300, 0, 0, 0.5)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当alpha值超出范围时返回错误', () => {
            const value = 'rgba(255, 0, 0, 1.5)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当格式不正确时返回错误', () => {
            const value = 'rgba(255, 0, 0)';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当缺少rgba前缀时返回错误', () => {
            const value = '255, 0, 0, 0.5';
            const rule: StringExtensionRuleOptions = {};

            const result = validateRGBAColor(value, rule, {});

            expect(result).not.toBeNull();
            if (result && result[0]) {
                expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
            }
        });

        it('当值为null时验证通过（跳过验证）', () => {
            const value = null;
            const rule: StringExtensionRuleOptions = {};

            // @ts-ignore - 测试 null 值
            const result = validateRGBAColor(value, rule, {});

            expect(result).toBeNull();
        });

        it('应该正确传递上下文信息', () => {
            const value = 'invalid_rgba';
            const rule: StringExtensionRuleOptions = {};
            const context: ValidationErrorContext = {
                field: 'testField',
                value,
            };

            const result = validateRGBAColor(value, rule, context);

            expect(result).not.toBeNull();
            if (result && result[0] && result[0].context) {
                expect(result[0].context.field).toBe('testField');
            }
        });
    });
});
