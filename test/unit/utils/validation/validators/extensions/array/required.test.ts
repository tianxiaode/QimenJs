import { validateRequiredArray, ValidationErrorContext } from '@/utils';

describe('validateRequiredArray函数测试', () => {
    it('当输入为非空数组时验证通过', () => {
        const value = [1, 2, 3];
        const rule = {};
        const result = validateRequiredArray(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为空数组时验证通过', () => {
        const value: any[] = [];
        const rule = {};
        const result = validateRequiredArray(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为null时验证失败', () => {
        const value = null;
        const rule = {};
        const result = validateRequiredArray(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为undefined时验证失败', () => {
        const value = undefined;
        const rule = {};
        const result = validateRequiredArray(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当输入为非数组类型时验证失败', () => {
        const value = 'not-an-array';
        const rule = {};
        const result = validateRequiredArray(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为数字时验证失败', () => {
        const value = 123;
        const rule = {};
        const result = validateRequiredArray(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = [1, 2, 3];
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredArray(value, rule, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应返回正确的错误上下文', () => {
        const value = 'not-an-array';
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredArray(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe('not-an-array');
        }
    });
});