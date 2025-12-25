import { validateNumberExtension, ValidationErrorContext, NumberExtensionRule } from '@/validation';

describe('validateNumberExtension函数测试', () => {
    it('当输入为有效的正数且规则要求为正数时验证通过', () => {
        const value = 5;
        const rule: NumberExtensionRule = { positive: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为负数但规则要求为正数时返回错误', () => {
        const value = -5;
        const rule: NumberExtensionRule = { positive: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为有效的负数且规则要求为负数时验证通过', () => {
        const value = -5;
        const rule: NumberExtensionRule = { negative: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为正数但规则要求为负数时返回错误', () => {
        const value = 5;
        const rule: NumberExtensionRule = { negative: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为有效的奇数且规则要求为奇数时验证通过', () => {
        const value = 7;
        const rule: NumberExtensionRule = { odd: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为偶数但规则要求为奇数时返回错误', () => {
        const value = 8;
        const rule: NumberExtensionRule = { odd: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为有效的偶数且规则要求为偶数时验证通过', () => {
        const value = 8;
        const rule: NumberExtensionRule = { even: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为奇数但规则要求为偶数时返回错误', () => {
        const value = 7;
        const rule: NumberExtensionRule = { even: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为有限数且规则要求为有限数时验证通过', () => {
        const value = 100;
        const rule: NumberExtensionRule = { finite: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为无限数但规则要求为有限数时返回错误', () => {
        const value = Infinity;
        const rule: NumberExtensionRule = { finite: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为无限数且规则要求为无限数时返回错误（基础验证会排除无限数）', () => {
        const value = Infinity;
        const rule: NumberExtensionRule = { infinite: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入在允许值列表中时验证通过', () => {
        const value = 5;
        const rule: NumberExtensionRule = { allowsValues: [1, 5, 10] };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入不在允许值列表中时返回错误', () => {
        const value = 7;
        const rule: NumberExtensionRule = { allowsValues: [1, 5, 10] };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入不在禁止值列表中时验证通过', () => {
        const value = 7;
        const rule: NumberExtensionRule = { disallowsValues: [1, 5, 10] };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入在禁止值列表中时返回错误', () => {
        const value = 5;
        const rule: NumberExtensionRule = { disallowsValues: [1, 5, 10] };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为非数字类型时返回类型错误', () => {
        const value = 'not-a-number';
        const rule: NumberExtensionRule = {};

        // @ts-ignore - 测试非数字类型
        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为null时返回无效值错误', () => {
        const value = null;
        const rule: NumberExtensionRule = {};

        // @ts-ignore - 测试 null 值
        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为undefined时返回必填错误', () => {
        const value = undefined;
        const rule: NumberExtensionRule = {};

        // @ts-ignore - 测试 undefined 值
        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当输入为NaN时返回无效值错误', () => {
        const value = NaN;
        const rule: NumberExtensionRule = {};

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当同时设置多个谓词规则且都满足时验证通过', () => {
        const value = 7; // 正数且为奇数
        const rule: NumberExtensionRule = { positive: true, odd: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当同时设置多个谓词规则但不满足时返回错误', () => {
        const value = 8; // 正数但不是奇数
        const rule: NumberExtensionRule = { positive: true, odd: true };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当值在允许值列表中但不满足其他规则时返回错误', () => {
        const value = -5; // 在允许值列表中，但不是正数
        const rule: NumberExtensionRule = {
            allowsValues: [1, -5, 10],
            positive: true,
        };

        const result = validateNumberExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = -5;
        const rule: NumberExtensionRule = { positive: true };
        const context: ValidationErrorContext = {
            field: 'testField',
            value,
        };

        const result = validateNumberExtension(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(-5);
        }
    });
});
