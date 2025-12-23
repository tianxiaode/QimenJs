import { checkRequiredFields } from '@/utils/validation/validators/core/object/required-fields';
import { ValidationErrorContext } from '@/utils';

describe('checkRequiredFields', () => {
  it('当对象包含所有必需字段时验证通过，返回null', () => {
    const value = { 
      field1: 'value1', 
      field2: 'value2', 
      field3: 'value3' 
    };
    const requiredFields = ['field1', 'field2', 'field3'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).toBeNull();
  });

  it('当对象包含所有必需字段（包括undefined值）时验证通过，返回null', () => {
    const value = { 
      field1: 'value1', 
      field2: undefined, 
      field3: 'value3' 
    };
    const requiredFields = ['field1', 'field2', 'field3'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).toBeNull();
  });

  it('当对象缺少必需字段时返回missing_field错误', () => {
    const value = { 
      field1: 'value1', 
      field3: 'value3' 
    };
    const requiredFields = ['field1', 'field2', 'field3'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (result && result.params) {
      expect(result.code).toBe('VALIDATION_MISSING_FIELD');
      expect(result.params.field).toBe('field2');
    }
  });

  it('当对象缺少多个必需字段时返回第一个missing_field错误', () => {
    const value = { 
      field1: 'value1' 
    };
    const requiredFields = ['field1', 'field2', 'field3', 'field4'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (result && result.params) {
      expect(result.code).toBe('VALIDATION_MISSING_FIELD');
      expect(result.params.field).toBe('field2');
    }
  });

  it('当必需字段列表为空时验证通过，返回null', () => {
    const value = { 
      field1: 'value1', 
      field2: 'value2' 
    };
    const requiredFields: string[] = [];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).toBeNull();
  });

  it('当值为空对象且必需字段列表不为空时返回第一个missing_field错误', () => {
    const value = {};
    const requiredFields = ['field1', 'field2'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (result && result.params) {
      expect(result.code).toBe('VALIDATION_MISSING_FIELD');
      expect(result.params.field).toBe('field1');
    }
  });

  it('当字段值为null时仍被视为存在，验证通过', () => {
    const value = { 
      field1: null, 
      field2: 'value2' 
    };
    const requiredFields = ['field1', 'field2'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).toBeNull();
  });

  it('应该正确传递上下文信息到错误对象', () => {
    const value = { 
      field1: 'value1' 
    };
    const requiredFields = ['field1', 'field2'];
    const context: ValidationErrorContext = { 
      field: 'testObject', 
      value 
    };

    const result = checkRequiredFields(value, requiredFields, context);

    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (result && result.params && result.context) {
      expect(result.code).toBe('VALIDATION_MISSING_FIELD');
      expect(result.params.field).toBe('field2');
      expect(result.context).toEqual({ 
        ...context, 
        field: 'field2' 
      });
    }
  });

  it('当上下文包含路径信息时正确构建字段路径', () => {
    const value = { 
      field1: 'value1' 
    };
    const requiredFields = ['field1', 'field2'];
    const context: ValidationErrorContext = { 
      path: 'parent.child', 
      value 
    };

    const result = checkRequiredFields(value, requiredFields, context);

    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (result && result.params && result.context) {
      expect(result.code).toBe('VALIDATION_MISSING_FIELD');
      expect(result.params.field).toBe('field2');
      expect(result.context).toEqual({ 
        ...context, 
        field: 'parent.child.field2' 
      });
    }
  });

  it('当字段名称包含特殊字符时正确处理', () => {
    const value = { 
      'field-with-dash': 'value1',
      'field with space': 'value2'
    };
    const requiredFields = ['field-with-dash', 'field with space', 'missing-field'];

    const result = checkRequiredFields(value, requiredFields, {});

    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (result && result.params) {
      expect(result.code).toBe('VALIDATION_MISSING_FIELD');
      expect(result.params.field).toBe('missing-field');
    }
  });
});