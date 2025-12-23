import { checkNumberInteger } from '@/utils/validation/validators/core/number/integer';
import { NumberRuleOptions, ValidationErrorContext } from '@/utils';

describe('checkNumberInteger', () => {
    it('当规则中没有要求整数时，应跳过整数验证并返回null', () => {
        const value = 3.14;
        const rule: NumberRuleOptions = {};

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当规则中integer为false时，应跳过整数验证并返回null', () => {
        const value = 3.14;
        const rule: NumberRuleOptions = { integer: false };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值为null且规则要求整数时，应跳过验证并返回null', () => {
        const value = null;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined且规则要求整数时，应跳过验证并返回null', () => {
        const value = undefined;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值是整数且规则要求整数时，应返回null', () => {
        const value = 42;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值是正整数且规则要求整数时，应返回null', () => {
        const value = 100;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值是负整数且规则要求整数时，应返回null', () => {
        const value = -42;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值是零且规则要求整数时，应返回null', () => {
        const value = 0;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).toBeNull();
    });

    it('当值是小数且规则要求整数时，应返回invalid_value错误', () => {
        const value = 3.14;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: 3.14 });
    });

    it('当值是NaN且规则要求整数时，应返回invalid_value错误', () => {
        const value = NaN;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: NaN });
    });

    it('当值是Infinity且规则要求整数时，应返回invalid_value错误', () => {
        const value = Infinity;
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: Infinity });
    });

    it('当值是字符串数字且规则要求整数时，应返回invalid_value错误', () => {
        const value = '123';
        const rule: NumberRuleOptions = { integer: true };

        const result = checkNumberInteger(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({ value: '123' });
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = 3.14;
        const rule: NumberRuleOptions = { integer: true };
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkNumberInteger(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.context).toEqual(context);
    });
});
