import { checkArrayLength } from '@/validation/validators/core/array/length';
import { ArrayRuleOptions, ValidationErrorContext } from '@/validation';

// 模拟一个简单的验证函数
const mockValidator = (): null => null;

describe('checkArrayLength', () => {
    it('当值不是数组时跳过验证并返回null', () => {
        const value = 'not an array';
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 1,
            maxLength: 5,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当值是数组且满足长度要求时验证通过，返回null', () => {
        const value = [1, 2, 3];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 2,
            maxLength: 5,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当数组长度小于最小长度时返回too_small错误', () => {
        const value = [1];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 3,
        };

        const result = checkArrayLength(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.params).toEqual({
            min: 3,
            value: 1,
            exclusive: false,
        });
    });

    it('当数组长度大于最大长度时返回too_large错误', () => {
        const value = [1, 2, 3, 4, 5];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            maxLength: 3,
        };

        const result = checkArrayLength(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.params).toEqual({
            max: 3,
            value: 5,
            exclusive: false,
        });
    });

    it('当数组长度不等于精确长度时返回invalid_value错误', () => {
        const value = [1, 2];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            exactLength: 3,
        };

        const result = checkArrayLength(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({
            value: 3,
        });
    });

    it('当数组为空且allowEmpty为false时返回invalid_value错误', () => {
        const value: any[] = [];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            allowEmpty: false,
        };

        const result = checkArrayLength(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_INVALID_VALUE');
        expect(result!.params).toEqual({
            value: 'empty_array',
        });
    });

    it('当数组为空且allowEmpty为true时验证通过', () => {
        const value: any[] = [];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            allowEmpty: true,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当数组为空且allowEmpty未设置时验证通过（默认为true）', () => {
        const value: any[] = [];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当数组满足精确长度时验证通过', () => {
        const value = [1, 2, 3];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            exactLength: 3,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当exactLength和minLength同时设置时，exactLength优先，minLength被忽略', () => {
        const value = [1, 2, 3];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            exactLength: 3,
            minLength: 5, // 这个应该被忽略
        };

        const result = checkArrayLength(value, rule);

        // 因为精确长度匹配，所以验证通过
        expect(result).toBeNull();
    });

    it('当exactLength和maxLength同时设置时，exactLength优先，maxLength被忽略', () => {
        const value = [1, 2, 3, 4, 5];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            exactLength: 5,
            maxLength: 3, // 这个应该被忽略
        };

        const result = checkArrayLength(value, rule);

        // 因为精确长度匹配，所以验证通过
        expect(result).toBeNull();
    });

    it('当值为null时跳过验证并返回null', () => {
        const value = null;
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 1,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时跳过验证并返回null', () => {
        const value = undefined;
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 1,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = [1];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 3,
        };
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkArrayLength(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.context).toEqual(context);
    });

    it('当数组长度等于最小长度时验证通过', () => {
        const value = [1, 2];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            minLength: 2,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });

    it('当数组长度等于最大长度时验证通过', () => {
        const value = [1, 2, 3];
        const rule: ArrayRuleOptions = {
            itemRule: mockValidator,
            maxLength: 3,
        };

        const result = checkArrayLength(value, rule);

        expect(result).toBeNull();
    });
});
