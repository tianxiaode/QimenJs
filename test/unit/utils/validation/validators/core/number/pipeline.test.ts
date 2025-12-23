import { validateNumber,NumberRuleOptions } from '@/utils';

describe('validateNumber', () => {
  it('当值有效时验证通过，返回null', () => {
    const value = 42;
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  it('当值为小数时验证通过，返回null', () => {
    const value = 3.14;
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  it('当值为零时验证通过，返回null', () => {
    const value = 0;
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  it('当值为负数时验证通过，返回null', () => {
    const value = -10;
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  // 存在性检查测试
  it('当值为undefined且required为true时返回required错误', () => {
    const value = undefined;
    const rule: NumberRuleOptions = { required: true };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_REQUIRED');
  });

  it('当值为null且nullable为false时返回invalid_value错误', () => {
    const value = null;
    const rule: NumberRuleOptions = { nullable: false };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
  });

  // 类型检查测试
  it('当值为NaN时返回invalid_value错误', () => {
    const value = NaN;
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
  });

  it('当值为Infinity时返回invalid_value错误', () => {
    const value = Infinity;
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
  });

  it('当值为字符串时返回type_mismatch错误', () => {
    const value = 'not a number';
    const rule: NumberRuleOptions = {};

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
  });

  // 整数检查测试
  it('当值为小数但规则要求整数时返回invalid_value错误', () => {
    const value = 3.14;
    const rule: NumberRuleOptions = { integer: true };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
  });

  it('当值为整数且规则要求整数时验证通过', () => {
    const value = 42;
    const rule: NumberRuleOptions = { integer: true };

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  // 范围检查测试
  it('当值小于最小值时返回too_small错误', () => {
    const value = 3;
    const rule: NumberRuleOptions = { min: 5 };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_TOO_SMALL');
  });

  it('当值大于最大值时返回too_large错误', () => {
    const value = 12;
    const rule: NumberRuleOptions = { max: 10 };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_TOO_LARGE');
  });

  it('当值超出范围时返回too_large错误', () => {
    const value = 15;
    const rule: NumberRuleOptions = { min: 5, max: 10 };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_TOO_LARGE');
  });

  it('当值小于最小值时返回too_small错误（多规则）', () => {
    const value = 2;
    const rule: NumberRuleOptions = { min: 5, max: 10 };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_TOO_SMALL');
  });

  // 枚举检查测试
  it('当值不在枚举列表中时返回not_allowed错误', () => {
    const value = 5;
    const rule: NumberRuleOptions = { enum: [1, 2, 3] };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_NOT_ALLOWED');
  });

  it('当值在枚举列表中时验证通过', () => {
    const value = 2;
    const rule: NumberRuleOptions = { enum: [1, 2, 3] };

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  // 组合验证测试
  it('当值同时违反多个规则时返回所有错误', () => {
    const value = 15;
    const rule: NumberRuleOptions = { 
      max: 10, 
      enum: [1, 2, 3] 
    };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);
    expect(result![0].code).toBe('VALIDATION_TOO_LARGE');
    expect(result![1].code).toBe('VALIDATION_NOT_ALLOWED');
  });

  it('当值为NaN且有其他规则时返回类型错误和枚举错误', () => {
    const value = NaN;
    const rule: NumberRuleOptions = { 
      min: 0, 
      max: 10,
      enum: [1, 2, 3]
    };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE'); // 类型检查错误
    expect(result![1].code).toBe('VALIDATION_NOT_ALLOWED');   // 枚举检查错误
  });

  it('当值为null且有其他规则时验证通过（因为默认nullable为true）', () => {
    const value = null;
    const rule: NumberRuleOptions = { 
      min: 0, 
      max: 10,
      enum: [1, 2, 3]
    };

    const result = validateNumber(value, rule);

    expect(result).toBeNull(); // 所有检查都会跳过，因为value是null
  });

  it('当值为null且nullable为false时返回invalid_value错误', () => {
    const value = null;
    const rule: NumberRuleOptions = { 
      nullable: false,
      min: 0, 
      max: 10,
      enum: [1, 2, 3]
    };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
  });

  it('当值为undefined且有其他规则时只返回required错误（如果required为true）', () => {
    const value = undefined;
    const rule: NumberRuleOptions = { 
      required: true,
      min: 0, 
      max: 10,
      enum: [1, 2, 3]
    };

    const result = validateNumber(value, rule);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_REQUIRED');
  });

  it('当值为undefined但required为false时验证通过', () => {
    const value = undefined;
    const rule: NumberRuleOptions = { 
      required: false,
      min: 0, 
      max: 10,
      enum: [1, 2, 3]
    };

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });
});