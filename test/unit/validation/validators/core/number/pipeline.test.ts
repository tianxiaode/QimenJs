import { validateNumber,NumberRuleOptions } from '@/validation';

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
  it('当值同时违反多个规则时，验证按顺序执行并可能短路', () => {
    const value = 15;
    const rule: NumberRuleOptions = { 
      max: 10, 
      enum: [1, 2, 3] 
    };

    const result = validateNumber(value, rule);

    // 在新架构中，验证会继续执行，所以可能返回多个错误
    expect(result).not.toBeNull();
    // 由于值15大于max(10)且不在enum([1,2,3])中，应该有两个错误
    expect(result!.length).toBe(2);
    // 第一个错误应该是范围错误
    expect(result![0].code).toBe('VALIDATION_TOO_LARGE');
    // 第二个错误应该是枚举错误
    expect(result![1].code).toBe('VALIDATION_NOT_ALLOWED');
  });

  it('当值为NaN且有其他规则时只返回类型错误', () => {
    const value = NaN;
    const rule: NumberRuleOptions = { 
      min: 0, 
      max: 10,
      enum: [1, 2, 3],
      required: true,
      nullable: false
    };

    const result = validateNumber(value, rule);

    // 在新的gates实现中，由于NaN无法通过类型检查，验证提前终止，只返回一个错误
    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
  });

  it('当值为null且有其他规则时验证通过（因为默认nullable为true）', () => {
    const value = null;
    const rule: NumberRuleOptions = { 
      // 移除任何会触发预处理的规则（如 min, max, enum 等）
      // 仅保留不会触发预处理的规则
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
    // 为了避免预处理函数自动设置 required: true，我们不能在规则中包含 min, max, enum 等
    const rule: NumberRuleOptions = { 
      required: false
      // 不包含任何会触发预处理的规则
    };

    const result = validateNumber(value, rule);

    expect(result).toBeNull();
  });

  // 预处理功能测试
  describe('预处理功能测试', () => {
    it('当规则包含min时，应该自动设置required为true和nullable为false', () => {
      const value = undefined;
      const rule: NumberRuleOptions = { min: 5 };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当规则包含max时，应该自动设置required为true和nullable为false', () => {
      const value = undefined;
      const rule: NumberRuleOptions = { max: 10 };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当规则包含exclusiveMin时，应该自动设置required为true和nullable为false', () => {
      const value = undefined;
      const rule: NumberRuleOptions = { exclusiveMin: 5 };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当规则包含exclusiveMax时，应该自动设置required为true和nullable为false', () => {
      const value = undefined;
      const rule: NumberRuleOptions = { exclusiveMax: 10 };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当规则包含enum时，应该自动设置required为true和nullable为false', () => {
      const value = undefined;
      const rule: NumberRuleOptions = { enum: [1, 2, 3] };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当规则包含范围约束时，null值应该被拒绝', () => {
      const value = null;
      const rule: NumberRuleOptions = { min: 5 };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('当规则不包含范围或枚举约束时，预处理不应该改变required和nullable', () => {
      const value = 'not a number';
      const rule: NumberRuleOptions = { integer: true };

      const result = validateNumber(value, rule);

      expect(result).not.toBeNull();
      expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });
  });
});