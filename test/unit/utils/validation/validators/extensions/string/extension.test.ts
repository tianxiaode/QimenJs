import {
    StringExtensionRuleOptions,
    validateStringExtension,
    ValidationErrorContext,
} from '@/utils';

describe('validateStringExtension', () => {
    it('当值为有效字符串且无特殊规则时验证通过', () => {
        const value = 'hello world';
        const rule: StringExtensionRuleOptions = {};

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为null且规则允许时验证通过', () => {
        const value = null;
        const rule: StringExtensionRuleOptions = { nullable: true };

        // @ts-ignore - 测试 null 值
        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为undefined且规则允许时验证通过', () => {
        const value = undefined;
        const rule: StringExtensionRuleOptions = { required: false };

        // @ts-ignore - 测试 undefined 值
        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值不是字符串类型时返回类型错误', () => {
        const value = 123;
        const rule: StringExtensionRuleOptions = {};

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].params) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params.expectedType).toBe('string');
            expect(result[0].params.actualType).toBe('number');
        }
    });

    it('当值为数字时返回类型错误', () => {
        const value = 42;
        const rule: StringExtensionRuleOptions = {};

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值为对象时返回类型错误', () => {
        const value = { text: 'hello' };
        const rule: StringExtensionRuleOptions = {};

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值为布尔值时返回类型错误', () => {
        const value = true;
        const rule: StringExtensionRuleOptions = {};

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当值为undefined但规则要求必需时返回required错误', () => {
        const value = undefined;
        const rule: StringExtensionRuleOptions = { required: true };

        // @ts-ignore - 测试 undefined 值
        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当值为null但规则不允许null时返回invalid_value错误', () => {
        const value = null;
        const rule: StringExtensionRuleOptions = { nullable: false };

        // @ts-ignore - 测试 null 值
        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当值为空字符串但规则不允许空值时返回invalid_value错误', () => {
        const value = '';
        const rule: StringExtensionRuleOptions = { empty: false };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当启用trim时正确去除首尾空白', () => {
        const value = '  hello world  ';
        const rule: StringExtensionRuleOptions = {
            trim: true,
            minLength: 1,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull(); // trim后应该是'hello world'，长度>1，验证通过
    });

    it('当启用trimInner时正确去除内部空白', () => {
        const value = 'hello   world';
        const rule: StringExtensionRuleOptions = {
            trimInner: true,
            exactLength: 10, // hello+world = 10个字符
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull(); // trimInner后应该是'helloworld'，长度为10，验证通过
    });

    it('当启用trimNewline时正确去除换行符', () => {
        const value = 'hello\n\r\nworld\n';
        const rule: StringExtensionRuleOptions = {
            trimNewline: true,
            exactLength: 10, // hello+world = 10个字符
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull(); // trimNewline后应该是'helloworld'，长度为10，验证通过
    });

    it('当同时启用trim和长度验证时正确处理', () => {
        const value = '   ';
        const rule: StringExtensionRuleOptions = {
            trim: true,
            minLength: 1,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull(); // trim后为空字符串，长度<1，验证失败
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TOO_SMALL');
        }
    });

    it('当字符串长度小于最小长度时返回错误', () => {
        const value = 'hi';
        const rule: StringExtensionRuleOptions = {
            minLength: 5,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TOO_SMALL');
        }
    });

    it('当字符串长度大于最大长度时返回错误', () => {
        const value = 'hello world';
        const rule: StringExtensionRuleOptions = {
            maxLength: 5,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TOO_LARGE');
        }
    });

    it('当字符串长度不符合精确长度时返回错误', () => {
        const value = 'hello';
        const rule: StringExtensionRuleOptions = {
            exactLength: 10,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_OUT_OF_RANGE');
        }
    });

    it('当字符串不在允许的枚举值中时返回错误', () => {
        const value = 'apple';
        const rule: StringExtensionRuleOptions = {
            enum: ['banana', 'orange', 'grape'],
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
        }
    });

    it('当字符串在允许的枚举值中时验证通过', () => {
        const value = 'banana';
        const rule: StringExtensionRuleOptions = {
            enum: ['banana', 'orange', 'grape'],
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当字符串不符合正则模式时返回错误', () => {
        const value = '123abc';
        const rule: StringExtensionRuleOptions = {
            pattern: /^\d+$/,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_PATTERN_MISMATCH');
        }
    });

    it('当字符串符合正则模式时验证通过', () => {
        const value = '123456';
        const rule: StringExtensionRuleOptions = {
            pattern: /^\d+$/,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('应该正确传递上下文信息', () => {
        const value = 123;
        const rule: StringExtensionRuleOptions = {};
        const context: ValidationErrorContext = {
            field: 'testField',
            value,
        };

        const result = validateStringExtension(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });

    it('当组合使用trim和正则模式时正确处理', () => {
        const value = '  abc123  ';
        const rule: StringExtensionRuleOptions = {
            trim: true,
            pattern: /^[a-z0-9]+$/,
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull(); // trim后是'abc123'，符合模式，验证通过
    });

    it('当组合使用多个预处理选项时正确处理', () => {
        const value = '  hello   world  \n\r\n  ';
        const rule: StringExtensionRuleOptions = {
            trim: true,
            trimInner: true,
            trimNewline: true,
            exactLength: 10, // helloworld = 10个字符
        };

        const result = validateStringExtension(value, rule, {});

        expect(result).toBeNull(); // 预处理后应该是'helloworld'，长度为10，验证通过
    });
});
