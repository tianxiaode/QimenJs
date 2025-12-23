import { checkBooleanEnum } from '@/utils/validation/validators/core/boolean/enum';
import { BooleanRuleOptions, ValidationErrorContext } from '@/utils';

describe('checkBooleanEnum', () => {
    it('当值不是布尔类型时，跳过验证并返回null', () => {
        const value = 'not a boolean';
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值不是布尔类型且规则中没有enum时，跳过验证并返回null', () => {
        const value = 123;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当规则中没有定义enum属性时，跳过验证并返回null', () => {
        const value = true;
        const rule: BooleanRuleOptions = {};

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值在枚举列表中时验证通过，返回null', () => {
        const value = true;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值在枚举列表中（false）时验证通过，返回null', () => {
        const value = false;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值不在枚举列表中时返回not_allowed错误', () => {
        const value = true;
        const rule: BooleanRuleOptions = { enum: [false] }; // 只允许false

        const result = checkBooleanEnum(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
        expect(result!.params).toEqual({
            value: true,
            allowedValues: [false],
        });
    });

    it('当值为false且不在枚举列表中时返回not_allowed错误', () => {
        const value = false;
        const rule: BooleanRuleOptions = { enum: [true] }; // 只允许true

        const result = checkBooleanEnum(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
        expect(result!.params).toEqual({
            value: false,
            allowedValues: [true],
        });
    });

    it('当枚举列表为空数组时，所有布尔值都返回not_allowed错误', () => {
        const value = true;
        const rule: BooleanRuleOptions = { enum: [] }; // 空枚举列表

        const result = checkBooleanEnum(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
        expect(result!.params).toEqual({
            value: true,
            allowedValues: [],
        });
    });

    it('当枚举列表只包含一个值时，另一个布尔值返回not_allowed错误', () => {
        const value = false;
        const rule: BooleanRuleOptions = { enum: [true] }; // 只允许true

        const result = checkBooleanEnum(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
        expect(result!.params).toEqual({
            value: false,
            allowedValues: [true],
        });
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = true;
        const rule: BooleanRuleOptions = { enum: [false] }; // 只允许false
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkBooleanEnum(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
        expect(result!.context).toEqual(context);
    });

    it('当值为null时跳过验证并返回null', () => {
        const value = null;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时跳过验证并返回null', () => {
        const value = undefined;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值为数字时跳过验证并返回null', () => {
        const value = 1;
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });

    it('当值为对象时跳过验证并返回null', () => {
        const value = {};
        const rule: BooleanRuleOptions = { enum: [true, false] };

        const result = checkBooleanEnum(value, rule);

        expect(result).toBeNull();
    });
});
