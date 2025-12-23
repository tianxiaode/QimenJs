import { checkDateType } from '@/utils/validation/validators/core/date/type';
import { DateRuleOptions, ValidationErrorContext } from '@/utils';

describe('checkDateType', () => {
    it('当值为null时，跳过验证并返回null', () => {
        const value = null;
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时，跳过验证并返回null', () => {
        const value = undefined;
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是有效Date对象时，验证通过并返回null', () => {
        const value = new Date('2023-01-01');
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是使用当前时间创建的Date对象时，验证通过并返回null', () => {
        const value = new Date();
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).toBeNull();
    });

    it('当值不是Date实例时，返回type_mismatch错误', () => {
        const value = '2023-01-01';
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'string',
        });
    });

    it('当值是数字时，返回type_mismatch错误', () => {
        const value = 123456789;
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'number',
        });
    });

    it('当值是对象但不是Date实例时，返回type_mismatch错误', () => {
        const value = {};
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'object',
        });
    });

    it('当值是数组时，返回type_mismatch错误', () => {
        const value = [1, 2, 3];
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'object',
        });
    });

    it('当值是Invalid Date时，返回type_mismatch错误', () => {
        const value = new Date('invalid date string');
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'object', // typeof Invalid Date is still 'object'
        });
    });

    it('当值是布尔值时，返回type_mismatch错误', () => {
        const value = true;
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'boolean',
        });
    });

    it('当值是函数时，返回type_mismatch错误', () => {
        const value = () => {};
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'function',
        });
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = 'not a date';
        const rule: DateRuleOptions = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkDateType(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.context).toEqual(context);
    });

    it('当值是Symbol时，返回type_mismatch错误', () => {
        const value = Symbol('test');
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'symbol',
        });
    });

    it('当值是BigInt时，返回type_mismatch错误', () => {
        const value = BigInt(123);
        const rule: DateRuleOptions = {};

        const result = checkDateType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'Date',
            actualType: 'bigint',
        });
    });
});
