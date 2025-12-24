import { validateRequiredDate, ValidationErrorContext } from '@/utils';

describe('validateRequiredDate函数测试', () => {
    it('当输入为日期对象时验证通过', () => {
        const value = new Date();
        const rule = {};
        const result = validateRequiredDate(value, rule, {});

        expect(result).toBeNull();
    });

    it('当输入为null时验证失败', () => {
        const value = null;
        const rule = {};
        const result = validateRequiredDate(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当输入为undefined时验证失败', () => {
        const value = undefined;
        const rule = {};
        const result = validateRequiredDate(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当输入为非日期类型时验证失败', () => {
        const value = 'not-a-date';
        const rule = {};
        const result = validateRequiredDate(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为数字时验证失败', () => {
        const value = 123;
        const rule = {};
        const result = validateRequiredDate(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当输入为时间戳数字时验证失败', () => {
        const value = Date.now();
        const rule = {};
        const result = validateRequiredDate(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = new Date();
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredDate(value, rule, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应返回正确的错误上下文', () => {
        const value = 'not-a-date';
        const rule = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = validateRequiredDate(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe('not-a-date');
        }
    });
});