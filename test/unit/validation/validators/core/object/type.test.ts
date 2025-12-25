import { checkObjectType } from '@/validation/validators/core/object/type';
import { ObjectRuleOptions, ValidationErrorContext } from '@/validation';

describe('checkObjectType', () => {
    it('当值为普通对象时验证通过，返回null', () => {
        const value = { key: 'value' };
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).toBeNull();
    });

    it('当值为复杂对象时验证通过，返回null', () => {
        const value = {
            nested: {
                property: 'value',
            },
            array: [1, 2, 3],
            func: () => 'test',
        };
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).toBeNull();
    });

    it('当值为null时跳过验证并返回null', () => {
        const value = null;
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时跳过验证并返回null', () => {
        const value = undefined;
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).toBeNull();
    });

    it('当值为数组时返回type_mismatch错误', () => {
        const value = [1, 2, 3];
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'object',
            actualType: 'object',
        });
    });

    it('当值为字符串时返回type_mismatch错误', () => {
        const value = 'not an object';
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'object',
            actualType: 'string',
        });
    });

    it('当值为数字时返回type_mismatch错误', () => {
        const value = 42;
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'object',
            actualType: 'number',
        });
    });

    it('当值为布尔值时返回type_mismatch错误', () => {
        const value = true;
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'object',
            actualType: 'boolean',
        });
    });

    it('当值为函数时返回type_mismatch错误', () => {
        const value = function () {
            return 'test';
        };
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.params).toEqual({
            expectedType: 'object',
            actualType: 'function',
        });
    });

    it('当值为日期对象时验证通过', () => {
        const value = new Date();
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        // 日期对象是对象类型，所以应该通过验证
        expect(result).toBeNull();
    });

    it('当值为正则表达式时验证通过', () => {
        const value = /test/;
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        // 正则表达式是对象类型，所以应该通过验证
        expect(result).toBeNull();
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = 'not an object';
        const rule: ObjectRuleOptions = {};
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkObjectType(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
        expect(result!.context).toEqual(context);
    });

    it('空对象应该通过类型检查', () => {
        const value = {};
        const rule: ObjectRuleOptions = {};

        const result = checkObjectType(value, rule);

        expect(result).toBeNull();
    });
});
