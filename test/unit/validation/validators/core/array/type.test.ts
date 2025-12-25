import { checkArrayType } from '@/validation/validators/core/array/type';
import { ArrayRuleOptions, ValidationErrorContext } from '@/validation';

// 模拟一个简单的验证函数
const mockValidator = (): null => null;

describe('checkArrayType', () => {
  it('当值为数组时验证通过，返回null', () => {
    const value = [1, 2, 3];
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).toBeNull();
  });

  it('当值为null时跳过验证并返回null', () => {
    const value = null;
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).toBeNull();
  });

  it('当值为undefined时跳过验证并返回null', () => {
    const value = undefined;
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).toBeNull();
  });

  it('当值为非数组类型时返回type_mismatch错误', () => {
    const value = 'not an array';
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'string' 
    });
  });

  it('当值为对象时返回type_mismatch错误', () => {
    const value = { a: 1, b: 2 };
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'object' 
    });
  });

  it('当值为数字时返回type_mismatch错误', () => {
    const value = 42;
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'number' 
    });
  });

  it('当值为布尔值时返回type_mismatch错误', () => {
    const value = true;
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'boolean' 
    });
  });

  it('当值为函数时返回type_mismatch错误', () => {
    const value = function() { return 'test'; };
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'function' 
    });
  });

  it('当值为日期对象时返回type_mismatch错误', () => {
    const value = new Date();
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'object' 
    });
  });

  it('当值为正则表达式时返回type_mismatch错误', () => {
    const value = /test/;
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.params).toEqual({ 
      expectedType: 'array', 
      actualType: 'object' 
    });
  });

  it('应该正确传递上下文信息到错误对象', () => {
    const value = 'not an array';
    const rule: ArrayRuleOptions = { itemRule: mockValidator };
    const context: ValidationErrorContext = { field: 'testField', value };

    const result = checkArrayType(value, rule, context);

    expect(result).not.toBeNull();
    expect(result!.code).toBe('VALIDATION_TYPE_MISMATCH');
    expect(result!.context).toEqual(context);
  });

  it('空数组应该通过类型检查', () => {
    const value: any[] = [];
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).toBeNull();
  });

  it('包含不同类型的元素的数组应该通过类型检查', () => {
    const value: any[] = [1, 'string', true, { obj: 'ect' }, null, undefined];
    const rule: ArrayRuleOptions = { itemRule: mockValidator };

    const result = checkArrayType(value, rule);

    expect(result).toBeNull();
  });
});