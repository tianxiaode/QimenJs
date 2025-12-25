import { validateAdditionalProperties } from '@/validation/validators/core/object/additional-properties';
import { ValidationErrorContext, ValidatorFunction } from '@/validation';

// 模拟验证函数
const mockValidator: ValidatorFunction = (value: any, rule: any, context?: any) => {
  if (typeof value !== 'string') {
    return [{ code: 'VALIDATION_ERROR', params: { value }, context }];
  }
  return null;
};

describe('validateAdditionalProperties', () => {
  it('当对象没有额外属性时验证通过，返回null', () => {
    const value = { 
      field1: 'value1', 
      field2: 'value2' 
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator,
      field2: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).toBeNull();
  });

  it('当对象包含额外属性时返回not_allowed错误', () => {
    const value = { 
      field1: 'value1', 
      field2: 'value2',
      extraField: 'extra' // 这是额外属性
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator,
      field2: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('extraField');
      expect(result[0].params.allowedValues).toEqual(['field1', 'field2']);
    }
  });

  it('当对象为空且属性规则也为空时验证通过', () => {
    const value = {};
    const properties: Record<string, any> = {};

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).toBeNull();
  });

  it('当对象为空但有属性规则时验证通过', () => {
    const value = {};
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator,
      field2: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).toBeNull();
  });

  it('当对象有属性但属性规则为空时返回not_allowed错误', () => {
    const value = { 
      field1: 'value1', 
      field2: 'value2' 
    };
    const properties: Record<string, any> = {};

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('field1');
      expect(result[0].params.allowedValues).toEqual([]);
    }
  });

  it('当对象包含多个额外属性时返回第一个额外属性的错误', () => {
    const value = { 
      field1: 'value1', 
      extraField1: 'extra1',  // 额外属性
      extraField2: 'extra2',  // 额外属性，但不会检查到
      field2: 'value2' 
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator,
      field2: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('extraField1');
      expect(result[0].params.allowedValues).toEqual(['field1', 'field2']);
    }
  });

  it('应该正确传递上下文信息到错误对象', () => {
    const value = { 
      field1: 'value1', 
      extraField: 'extra' 
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator
    };
    
    const context: ValidationErrorContext = { 
      field: 'testObject', 
      value 
    };

    const result = validateAdditionalProperties(value, properties, context);

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].context) {
      expect(result[0].context.field).toBe('extraField'); // 应该是额外属性的路径
    }
  });

  it('当上下文包含路径信息时正确构建字段路径', () => {
    const value = { 
      field1: 'value1', 
      extraField: 'extra' 
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator
    };
    
    const context: ValidationErrorContext = { 
      path: 'parent.child', 
      value 
    };

    const result = validateAdditionalProperties(value, properties, context);

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].context) {
      expect(result[0].context.field).toBe('parent.child.extraField'); // 应该是 field，而不是 path
    }
  });

  it('当属性名包含特殊字符时正确处理', () => {
    const value = { 
      'field-with-dash': 'value1',
      'field with space': 'value2',
      'field@special': 'value3'  // 额外属性
    };
    
    const properties: Record<string, ValidatorFunction> = {
      'field-with-dash': mockValidator,
      'field with space': mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('field@special');
      expect(result[0].params.allowedValues).toEqual(['field-with-dash', 'field with space']);
    }
  });

  it('当对象属性值为各种类型时正确处理', () => {
    const value = { 
      field1: 'value1', 
      field2: 42,
      field3: true,
      field4: [1, 2, 3],
      field5: { nested: 'object' },
      extraField: null  // 额外属性
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator,
      field2: mockValidator,
      field3: mockValidator,
      field4: mockValidator,
      field5: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).not.toBeNull(); // 有额外属性，验证不通过
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('extraField');
      expect(result[0].params.allowedValues).toEqual(['field1', 'field2', 'field3', 'field4', 'field5']);
    }
  });

  it('当对象包含额外属性且属性值为各种类型时正确返回错误', () => {
    const value = { 
      field1: 'value1', 
      extraFieldNumber: 42,  // 额外属性
      extraFieldBoolean: true,  // 额外属性，但不会检查到
    };
    
    const properties: Record<string, ValidatorFunction> = {
      field1: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    expect(result).not.toBeNull();
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('extraFieldNumber');
      expect(result[0].params.allowedValues).toEqual(['field1']);
    }
  });

  it('验证对象的可枚举属性，包括从原型继承的', () => {
    const baseObj = { inheritedField: 'inherited' };
    const value = Object.create(baseObj);
    value.ownField = 'own';
    value.extraField = 'extra';
    
    const properties: Record<string, ValidatorFunction> = {
      ownField: mockValidator
    };

    const result = validateAdditionalProperties(value, properties, {});

    // Object.keys() 只返回对象自身的可枚举属性，不包括继承的
    expect(result).not.toBeNull();
    if (result && result[0] && result[0].params) {
      expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
      expect(result[0].params.value).toBe('extraField');
    }
  });
});