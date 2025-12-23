import { checkDateRange } from '@/utils/validation/validators/core/date/range';
import { ValidationErrorContext,DateRuleOptions } from '@/utils';

describe('checkDateRange', () => {
  it('当值不是Date实例时，跳过验证并返回null', () => {
    const value = 'not a date';
    const rule: DateRuleOptions = {};

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值是Invalid Date时，跳过验证并返回null', () => {
    const value = new Date('invalid date');
    const rule: DateRuleOptions = {};

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当没有设置范围限制时，验证通过并返回null', () => {
    const value = new Date('2023-01-01');
    const rule: DateRuleOptions = {};

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值在min日期范围内时验证通过', () => {
    const value = new Date('2023-06-01');
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值等于min日期时验证通过', () => {
    const value = new Date('2023-01-01');
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值早于min日期时返回too_small错误', () => {
    const value = new Date('2022-12-31');
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TOO_SMALL');
    expect(result!.params).toEqual({ 
      min: new Date('2023-01-01').getTime(), 
      value: new Date('2022-12-31'), 
      exclusive: false 
    });
  });

  it('当值在max日期范围内时验证通过', () => {
    const value = new Date('2023-06-01');
    const rule: DateRuleOptions = { max: new Date('2023-12-31') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值等于max日期时验证通过', () => {
    const value = new Date('2023-12-31');
    const rule: DateRuleOptions = { max: new Date('2023-12-31') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值晚于max日期时返回too_large错误', () => {
    const value = new Date('2024-01-01');
    const rule: DateRuleOptions = { max: new Date('2023-12-31') };

    const result = checkDateRange(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TOO_LARGE');
    expect(result!.params).toEqual({ 
      max: new Date('2023-12-31').getTime(), 
      value: new Date('2024-01-01'), 
      exclusive: false 
    });
  });

  it('当值同时满足min和max日期范围时验证通过', () => {
    const value = new Date('2023-06-01');
    const rule: DateRuleOptions = { 
      min: new Date('2023-01-01'), 
      max: new Date('2023-12-31') 
    };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值不满足min和max日期范围时返回too_small错误', () => {
    const value = new Date('2022-12-31');
    const rule: DateRuleOptions = { 
      min: new Date('2023-01-01'), 
      max: new Date('2023-12-31') 
    };

    const result = checkDateRange(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TOO_SMALL');
    expect(result!.params).toEqual({ 
      min: new Date('2023-01-01').getTime(), 
      value: new Date('2022-12-31'), 
      exclusive: false 
    });
  });

  it('当值超出max日期范围时返回too_large错误', () => {
    const value = new Date('2024-01-01');
    const rule: DateRuleOptions = { 
      min: new Date('2023-01-01'), 
      max: new Date('2023-12-31') 
    };

    const result = checkDateRange(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TOO_LARGE');
    expect(result!.params).toEqual({ 
      max: new Date('2023-12-31').getTime(), 
      value: new Date('2024-01-01'), 
      exclusive: false 
    });
  });

  it('应该正确传递上下文信息到错误对象', () => {
    const value = new Date('2022-12-31');
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };
    const context: ValidationErrorContext = { field: 'testField', value };

    const result = checkDateRange(value, rule, context);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TOO_SMALL');
    expect(result!.context).toEqual(context);
  });

  it('当值为null时跳过验证并返回null', () => {
    const value = null;
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值为undefined时跳过验证并返回null', () => {
    const value = undefined;
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值为数字时跳过验证并返回null', () => {
    const value = 12345;
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });

  it('当值为对象但不是Date实例时跳过验证并返回null', () => {
    const value = {};
    const rule: DateRuleOptions = { min: new Date('2023-01-01') };

    const result = checkDateRange(value, rule);

    expect(result).toBeNull();
  });
});