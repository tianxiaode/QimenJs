import { checkNumberRange } from '@/validation/validators/core/number/range';
import { ValidationErrorContext, NumberRuleOptions } from '@/validation';

describe('checkNumberRange', () => {
    it('当值为null时不执行范围验证并返回null', () => {
        const value = null;
        const rule: NumberRuleOptions = { min: 1, max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined时不执行范围验证并返回null', () => {
        const value = undefined;
        const rule: NumberRuleOptions = { min: 1, max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当没有设置范围限制时，验证通过并返回null', () => {
        const value = 5;
        const rule: NumberRuleOptions = {};

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值在min范围内时验证通过', () => {
        const value = 5;
        const rule: NumberRuleOptions = { min: 3 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值等于min边界值时验证通过', () => {
        const value = 5;
        const rule: NumberRuleOptions = { min: 5 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值小于min时返回too_small错误', () => {
        const value = 2;
        const rule: NumberRuleOptions = { min: 5 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.params).toEqual({ min: 5, value: 2, exclusive: false });
    });

    it('当值在max范围内时验证通过', () => {
        const value = 5;
        const rule: NumberRuleOptions = { max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值等于max边界值时验证通过', () => {
        const value = 10;
        const rule: NumberRuleOptions = { max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值大于max时返回too_large错误', () => {
        const value = 12;
        const rule: NumberRuleOptions = { max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.params).toEqual({ max: 10, value: 12, exclusive: false });
    });

    it('当值大于exclusiveMin时验证通过', () => {
        const value = 8;
        const rule: NumberRuleOptions = { exclusiveMin: 5 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值等于exclusiveMin时返回too_small错误（exclusive=true）', () => {
        const value = 5;
        const rule: NumberRuleOptions = { exclusiveMin: 5 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.params).toEqual({ min: 5, value: 5, exclusive: true });
    });

    it('当值小于exclusiveMin时返回too_small错误（exclusive=true）', () => {
        const value = 3;
        const rule: NumberRuleOptions = { exclusiveMin: 5 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.params).toEqual({ min: 5, value: 3, exclusive: true });
    });

    it('当值小于exclusiveMax时验证通过', () => {
        const value = 8;
        const rule: NumberRuleOptions = { exclusiveMax: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值等于exclusiveMax时返回too_large错误（exclusive=true）', () => {
        const value = 10;
        const rule: NumberRuleOptions = { exclusiveMax: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.params).toEqual({ max: 10, value: 10, exclusive: true });
    });

    it('当值大于exclusiveMax时返回too_large错误（exclusive=true）', () => {
        const value = 15;
        const rule: NumberRuleOptions = { exclusiveMax: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.params).toEqual({ max: 10, value: 15, exclusive: true });
    });

    it('当值同时满足min和max范围时验证通过', () => {
        const value = 5;
        const rule: NumberRuleOptions = { min: 3, max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值不满足min和max范围时返回too_small错误', () => {
        const value = 1;
        const rule: NumberRuleOptions = { min: 3, max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.params).toEqual({ min: 3, value: 1, exclusive: false });
    });

    it('当值不满足min和max范围时返回too_large错误', () => {
        const value = 15;
        const rule: NumberRuleOptions = { min: 3, max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.params).toEqual({ max: 10, value: 15, exclusive: false });
    });

    it('当值同时满足所有范围限制时验证通过', () => {
        const value = 7;
        const rule: NumberRuleOptions = { min: 5, max: 10, exclusiveMin: 5, exclusiveMax: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).toBeNull();
    });

    it('当值不满足多个范围限制时返回第一个错误（min检查优先）', () => {
        const value = 4;
        const rule: NumberRuleOptions = { min: 5, max: 3 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_SMALL');
        expect(result!.params).toEqual({ min: 5, value: 4, exclusive: false });
    });

    it('当值超过max范围时返回too_large错误', () => {
        const value = 12;
        const rule: NumberRuleOptions = { min: 5, max: 10 };

        const result = checkNumberRange(value, rule);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.params).toEqual({ max: 10, value: 12, exclusive: false });
    });

    it('应该正确传递上下文信息到错误对象', () => {
        const value = 15;
        const rule: NumberRuleOptions = { max: 10 };
        const context: ValidationErrorContext = { field: 'testField', value };

        const result = checkNumberRange(value, rule, context);

        expect(result).not.toBeNull();
        expect(result!.code).toBe('VALIDATION_TOO_LARGE');
        expect(result!.context).toEqual(context);
    });

    it('当值为NaN时，范围检查不会触发错误（NaN在类型检查阶段被拦截）', () => {
      const value = NaN;
      const rule: NumberRuleOptions = { min: 5 };
      
      const result = checkNumberRange(value, rule);
      
      // NaN与任何数字的比较都是false，所以不会触发范围检查错误
      // 在实际验证管道中，NaN会在类型检查阶段被拦截
      // 但在这个独立的范围检查函数中，它不会触发范围错误
      expect(result).toBeNull();
    });

    it('当值为Infinity时，如果超出范围限制应返回相应错误', () => {
      const value = Infinity;
      const rule: NumberRuleOptions = { max: 100 };
      
      const result = checkNumberRange(value, rule);
      
      expect(result).not.toBeNull();
      expect(result!.code).toBe('VALIDATION_TOO_LARGE');
      expect(result!.params).toEqual({ max: 100, value: Infinity, exclusive: false });
    });

    it('当值为-Infinity时，如果超出范围限制应返回相应错误', () => {
      const value = -Infinity;
      const rule: NumberRuleOptions = { min: 5 };
      
      const result = checkNumberRange(value, rule);
      
      expect(result).not.toBeNull();
      expect(result!.code).toBe('VALIDATION_TOO_SMALL');
      expect(result!.params).toEqual({ min: 5, value: -Infinity, exclusive: false });
    });
});
