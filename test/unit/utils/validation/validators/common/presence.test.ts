import { validatePresence, ValidationErrorCode } from '@/utils';

describe('validatePresence', () => {
  describe('required validation', () => {
    test('should return required error when value is undefined and required is true', () => {
      const result = validatePresence(undefined, { required: true });
      expect(result).not.toBeNull();
      expect(result?.[0]?.code).toBe(ValidationErrorCode.REQUIRED);
    });

    test('should return required error when value is null and required is true', () => {
      const result = validatePresence(null, { required: true });
      expect(result).not.toBeNull();
      expect(result?.[0]?.code).toBe(ValidationErrorCode.REQUIRED);
    });

    test('should return null when value exists and required is true', () => {
      expect(validatePresence('test', { required: true })).toBeNull();
      expect(validatePresence(0, { required: true })).toBeNull();
      expect(validatePresence(false, { required: true })).toBeNull();
      expect(validatePresence('', { required: true })).toBeNull();
    });

    test('should return null when value does not exist and required is false', () => {
      expect(validatePresence(undefined, { required: false })).toBeNull();
      expect(validatePresence(null, { required: false })).toBeNull();
    });
  });

  describe('nullable validation', () => {
    test('should return invalid_value error when value is null and nullable is false', () => {
      const context = { field: 'testField' };
      const result = validatePresence(null, { nullable: false }, context);
      expect(result).not.toBeNull();
      expect(result?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(result?.[0]?.params?.value).toBeNull();
      expect(result?.[0]?.context).toBe(context);
    });

    test('should return null when value is null and nullable is true', () => {
      expect(validatePresence(null, { nullable: true })).toBeNull();
    });

    test('should return null when value is not null and nullable is false', () => {
      expect(validatePresence('test', { nullable: false })).toBeNull();
      expect(validatePresence(0, { nullable: false })).toBeNull();
    });
  });

  describe('empty validation', () => {
    test('should return invalid_value error when value is empty and empty is false', () => {
      const context = { field: 'testField' };

      // Test various empty values
      const resultStr = validatePresence('', { empty: false }, context);
      expect(resultStr).not.toBeNull();
      expect(resultStr?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(resultStr?.[0]?.params?.value).toBe('');
      expect(resultStr?.[0]?.context).toBe(context);

      const resultArr = validatePresence([], { empty: false }, context);
      expect(resultArr).not.toBeNull();
      expect(resultArr?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(resultArr?.[0]?.params?.value).toEqual([]);
      expect(resultArr?.[0]?.context).toBe(context);

      const resultObj = validatePresence({}, { empty: false }, context);
      expect(resultObj).not.toBeNull();
      expect(resultObj?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(resultObj?.[0]?.params?.value).toEqual({});
      expect(resultObj?.[0]?.context).toBe(context);
    });

    test('should return null when value is empty and empty is true', () => {
      expect(validatePresence('', { empty: true })).toBeNull();
      expect(validatePresence([], { empty: true })).toBeNull();
      expect(validatePresence({}, { empty: true })).toBeNull();
    });

    test('should return null when value is not empty and empty is false', () => {
      expect(validatePresence('test', { empty: false })).toBeNull();
      expect(validatePresence([1], { empty: false })).toBeNull();
      expect(validatePresence({ a: 1 }, { empty: false })).toBeNull();
      expect(validatePresence(0, { empty: false })).toBeNull();
      expect(validatePresence(false, { empty: false })).toBeNull();
    });
  });

  describe('combined validation', () => {
    test('should handle required and nullable together', () => {
      // Value is required but null is not allowed - should return required error first
      // (because validation order is required check first, then nullable check)
      const result1 = validatePresence(null, { required: true, nullable: false });
      expect(result1).not.toBeNull();
      expect(result1?.[0]?.code).toBe(ValidationErrorCode.REQUIRED);

      // Value is not required and null is not allowed
      const result2 = validatePresence(null, { required: false, nullable: false });
      expect(result2).not.toBeNull();
      expect(result2?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
    });

    test('should handle required and empty together - empty string case', () => {
      // 空字符串存在（不是undefined或null），所以不会触发required错误
      // 但是由于empty为false，所以会返回invalid_value错误
      const result = validatePresence('', { required: true, empty: false });
      expect(result).not.toBeNull();
      expect(result?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(result?.[0]?.params?.value).toBe('');

      // 空字符串存在（不是undefined或null），且empty为false
      const result2 = validatePresence('', { required: false, empty: false });
      expect(result2).not.toBeNull();
      expect(result2?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(result2?.[0]?.params?.value).toBe('');
    });

    test('should pass when all conditions are satisfied', () => {
      expect(
        validatePresence('test', { required: true, nullable: false, empty: false })
      ).toBeNull();
      expect(
        validatePresence(123, { required: false, nullable: false, empty: false })
      ).toBeNull();
    });
  });

  describe('default options', () => {
    test('should use default options when no rule is provided', () => {
      // By default, required=false, nullable=true, empty=true
      expect(validatePresence(undefined, {})).toBeNull();
      expect(validatePresence(null, {})).toBeNull();
      expect(validatePresence('', {})).toBeNull();
      expect(validatePresence([], {})).toBeNull();
    });
  });

  describe('context propagation', () => {
    test('should pass context to error builders', () => {
      const context = {
        field: 'email',
        label: 'Email Address',
        parent: { user: 'test' },
      };

      const result = validatePresence(undefined, { required: true }, context);
      expect(result).not.toBeNull();
      expect(result?.[0]?.code).toBe(ValidationErrorCode.REQUIRED);
      expect(result?.[0]?.context).toBe(context);

      const result2 = validatePresence(null, { nullable: false }, context);
      expect(result2).not.toBeNull();
      expect(result2?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(result2?.[0]?.params?.value).toBeNull();
      expect(result2?.[0]?.context).toBe(context);

      const result3 = validatePresence('', { empty: false }, context);
      expect(result3).not.toBeNull();
      expect(result3?.[0]?.code).toBe(ValidationErrorCode.INVALID_VALUE);
      expect(result3?.[0]?.params?.value).toBe('');
      expect(result3?.[0]?.context).toBe(context);
    });
  });
});