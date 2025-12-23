import { checkBooleanType } from '@/utils/validation/validators/core/boolean/type';
import { BooleanRuleOptions, ValidationErrorContext } from '@/utils';

describe('checkBooleanType', () => {
    it('当值为true时验证通过，返回null', () => {
        const testValue = true;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).toBeNull();
    });

    it('当值为false时验证通过，返回null', () => {
        const testValue = false;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).toBeNull();
    });

    it('当值为null时跳过验证并返回null', () => {
        const testValue = null;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时跳过验证并返回null', () => {
        const testValue = undefined;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).toBeNull();
    });

    it('当值是字符串时返回type_mismatch错误', () => {
        const testValue = 'true';
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'string',
        });
    });

    it('当值是数字时返回type_mismatch错误', () => {
        const testValue = 1;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'number',
        });
    });

    it('当值是对象时返回type_mismatch错误', () => {
        const testValue = {};
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'object',
        });
    });

    it('当值是数组时返回type_mismatch错误', () => {
        const testValue: any[] = [];
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'object',
        });
    });

    it('当值是函数时返回type_mismatch错误', () => {
        const testValue = () => {};
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'function',
        });
    });

    it('当值是Symbol时返回type_mismatch错误', () => {
        const testValue = Symbol('test');
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'symbol',
        });
    });

    it('当值是BigInt时返回type_mismatch错误', () => {
        const testValue = BigInt(123);
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'bigint',
        });
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const testValue = 'not a boolean';
        const rule: BooleanRuleOptions = {};
        const context: ValidationErrorContext = { field: 'testField', value: testValue };

        const result = checkBooleanType(testValue, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.context).toEqual(context);
    });

    it('当值是0时返回type_mismatch错误', () => {
        const testValue = 0;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'number',
        });
    });

    it('当值是空字符串时返回type_mismatch错误', () => {
        const testValue = '';
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanType(testValue, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'boolean',
            actualType: 'string',
        });
    });
});
