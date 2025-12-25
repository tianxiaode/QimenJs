import { checkNumberType } from '@/validation/validators/core/number/type';
import { NumberRuleOptions, ValidationErrorContext } from '@/validation';

describe('checkNumberType', () => {
    it('当值为null时，跳过类型验证并返回null', () => {
        const value = null;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时，跳过类型验证并返回null', () => {
        const value = undefined;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是有限数字时，验证通过并返回null', () => {
        const value = 42;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是小数时，验证通过并返回null', () => {
        const value = 3.14;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是负数时，验证通过并返回null', () => {
        const value = -42;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是零时，验证通过并返回null', () => {
        const value = 0;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).toBeNull();
    });

    it('当值是NaN时，返回无效值错误', () => {
        const value = NaN;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: NaN });
    });

    it('当值是Infinity时，返回无效值错误', () => {
        const value = Infinity;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: Infinity });
    });

    it('当值是-Infinity时，返回无效值错误', () => {
        const value = -Infinity;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: -Infinity });
    });

    it('当值是字符串时，返回类型不匹配错误', () => {
        const value = '42';
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'string' });
    });

    it('当值是布尔值时，返回类型不匹配错误', () => {
        const value = true;
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'boolean' });
    });

    it('当值是对象时，返回类型不匹配错误', () => {
        const value = {};
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'object' });
    });

    it('当值是数组时，返回类型不匹配错误', () => {
        const value = [1, 2, 3];
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'object' });
    });

    it('当值是函数时，返回类型不匹配错误', () => {
        const value = () => {};
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'function' });
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = 'not a number';
        const rule: NumberRuleOptions = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkNumberType(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.context).toEqual(context);
    });

    it('当值是Symbol时，返回类型不匹配错误', () => {
        const value = Symbol('test');
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'symbol' });
    });

    it('当值是BigInt时，返回类型不匹配错误', () => {
        const value = BigInt(123);
        const rule: NumberRuleOptions = {};

        const result = checkNumberType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({ expectedType: 'number', actualType: 'bigint' });
    });
});
