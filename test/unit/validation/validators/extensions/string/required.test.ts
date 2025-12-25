import { validateRequiredString, ValidationErrorContext } from '@/validation';

describe('validateRequiredString函数测试', () => {
    it('当输入为普通字符串时验证通过', () => {
        const value = 'hello world';
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为空字符串时验证通过', () => {
        const value = '';
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为null时验证失败', () => {
        const value = null;
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为undefined时验证失败', () => {
        const value = undefined;
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当输入为非字符串类型时验证失败', () => {
        const value = 123;
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为数字字符串时验证失败', () => {
        const value = 456;
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为对象时验证失败', () => {
        const value = { name: 'test' };
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为数组时验证失败', () => {
        const value = [1, 2, 3];
        const rule = {};
        const result = validateRequiredString(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = 'test string';
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredString(value, rule, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应返回正确的错误上下文', () => {
        const value = 123;
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredString(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(123);
        }
    });
});