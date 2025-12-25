import { checkArrayEnum } from '@/validation/validators/core/array/enum';
import { ArrayRuleOptions, ValidationErrorContext, ValidationResult } from '@/validation';

// 模拟一个简单的验证函数，返回null表示验证通过
const mockValidator = (): ValidationResult => null;

describe('checkArrayEnum', () => {
  it('当值不是数组时跳过验证并返回null', () => {
    const value = 'not an array';
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[1, 2], [3, 4]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当值是数组且在枚举列表中时验证通过，返回null', () => {
    const value = [1, 2, 3];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[1, 2], [1, 2, 3], [4, 5]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当值是数组且在枚举列表中（字符串数组）时验证通过，返回null', () => {
    const value = ['a', 'b'];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [['a', 'b'], ['c', 'd']] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当值是数组但不在枚举列表中时返回not_allowed错误', () => {
    const value = [1, 2, 3];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[4, 5], [6, 7]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
    expect(result!.params).toEqual({ 
      value: [1, 2, 3], 
      allowedValues: [[4, 5], [6, 7]] 
    });
  });

  it('当规则中没有定义enum属性时跳过验证并返回null', () => {
    const value = [1, 2, 3];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当枚举列表为空数组时，所有数组都返回not_allowed错误', () => {
    const value = [1, 2];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
    expect(result!.params).toEqual({ 
      value: [1, 2], 
      allowedValues: [] 
    });
  });

  it('当值是对象数组且在枚举列表中时验证通过', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const value = [obj1, obj2];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[obj1, obj2], [{ id: 3 }]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当值是对象数组但不在枚举列表中时返回not_allowed错误', () => {
    const value = [{ id: 1 }, { id: 2 }];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[{ id: 3 }], [{ id: 4 }]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
    expect(result!.params).toEqual({ 
      value: [{ id: 1 }, { id: 2 }], 
      allowedValues: [[{ id: 3 }], [{ id: 4 }]] 
    });
  });

  it('应该正确传递上下文信息到错误对象', () => {
    const value = [1, 2, 3];
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[4, 5]] 
    };
    const context: ValidationErrorContext = { field: 'testField', value };

    const result = checkArrayEnum(value, rule, context);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_NOT_ALLOWED');
    expect(result!.context).toEqual(context);
  });

  it('当值是null时跳过验证并返回null', () => {
    const value = null;
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[1, 2], [3, 4]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当值是undefined时跳过验证并返回null', () => {
    const value = undefined;
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[1, 2], [3, 4]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });

  it('当值是数字时跳过验证并返回null', () => {
    const value = 123;
    const rule: ArrayRuleOptions = { 
      itemRule: mockValidator,
      enum: [[1, 2], [3, 4]] 
    };

    const result = checkArrayEnum(value, rule);

    expect(result).toBeNull();
  });
});