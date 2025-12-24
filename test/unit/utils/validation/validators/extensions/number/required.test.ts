import { validateRequiredNumber, ValidationErrorContext } from '@/utils';

describe('validateRequiredNumber函数测试', () => {
    it('当输入为有效数字时验证通过', () => {
        const value = 42;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为浮点数时验证通过', () => {
        const value = 3.14;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为0时验证通过', () => {
        const value = 0;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为null时验证失败', () => {
        const value = null;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为undefined时验证失败', () => {
        const value = undefined;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当输入为非数字类型时验证失败', () => {
        const value = 'not-a-number';
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为字符串数字时验证失败', () => {
        const value = '123';
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为NaN时验证失败', () => {
        const value = NaN;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为Infinity时验证失败', () => {
        const value = Infinity;
        const rule = {};
        const result = validateRequiredNumber(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = 42;
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredNumber(value, rule, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应返回正确的错误上下文', () => {
        const value = 'not-a-number';
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredNumber(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe('not-a-number');
        }
    });
});