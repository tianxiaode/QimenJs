import { validatePattern, ValidationErrorCode } from '@/utils';

describe('validatePattern', () => {
  // 测试匹配成功的情况
  it('should return null when value matches the pattern', () => {
    const rule = { pattern: /^[a-zA-Z]+$/ };
    const result = validatePattern('hello', rule);
    expect(result).toBeNull();
  });

  // 测试匹配失败的情况 - 修正期望的 pattern 格式
  it('should return pattern mismatch error when value does not match the pattern', () => {
    const rule = { pattern: /^[a-zA-Z]+$/ };
    const result = validatePattern('hello123', rule);
    
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      code: ValidationErrorCode.PATTERN_MISMATCH,
      params: { 
        pattern: '^[a-zA-Z]+$', 
        value: 'hello123' 
      },
      context: {}
    });
  });

  // 测试未定义模式的情况
  it('should return null when pattern is not defined in rule', () => {
    const rule = {};
    const result = validatePattern('hello', rule);
    expect(result).toBeNull();
  });

  // 测试空字符串
  it('should handle empty string correctly', () => {
    const rule = { pattern: /^hello$/ };
    const result = validatePattern('', rule);
    
    expect(result).not.toBeNull();
    expect(result![0].code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
  });

  // 测试非字符串值 - 数字
  it('should return pattern mismatch error for non-string values', () => {
    const rule = { pattern: /^[a-zA-Z]+$/ };
    const result = validatePattern(12345, rule);
    
    expect(result).not.toBeNull();
    expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
  });

  // 测试非字符串值 - 布尔值
  it('should return pattern mismatch error for boolean values', () => {
    const rule = { pattern: /^[a-zA-Z]+$/ };
    const result = validatePattern(true, rule);
    
    expect(result).not.toBeNull();
    expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
  });

  // 测试邮箱模式
  it('should validate email pattern correctly', () => {
    const emailRule = { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
    
    // 有效邮箱
    const validEmailResult = validatePattern('test@example.com', emailRule);
    expect(validEmailResult).toBeNull();
    
    // 无效邮箱
    const invalidEmailResult = validatePattern('invalid-email', emailRule);
    expect(invalidEmailResult).not.toBeNull();
    expect(invalidEmailResult![0].code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
  });

  // 测试手机号模式
  it('should validate phone number pattern correctly', () => {
    const phoneRule = { pattern: /^\d{11}$/ };
    
    // 有效手机号
    const validPhoneResult = validatePattern('13812345678', phoneRule);
    expect(validPhoneResult).toBeNull();
    
    // 无效手机号
    const invalidPhoneResult = validatePattern('12345', phoneRule);
    expect(invalidPhoneResult).not.toBeNull();
    expect(invalidPhoneResult![0].code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
  });

  // 测试复杂正则
  it('should handle complex regex patterns', () => {
    const complexRule = { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/ };
    
    // 符合复杂密码要求
    const strongPasswordResult = validatePattern('MyPass123', complexRule);
    expect(strongPasswordResult).toBeNull();
    
    // 不符合复杂密码要求
    const weakPasswordResult = validatePattern('weak', complexRule);
    expect(weakPasswordResult).not.toBeNull();
    expect(weakPasswordResult![0].code).toBe(ValidationErrorCode.PATTERN_MISMATCH);
  });

  // 测试上下文信息 - 修正期望的 pattern 格式
  it('should include context in error when provided', () => {
    const rule = { pattern: /^[a-zA-Z]+$/ };
    const context = { field: 'username', label: '用户名' };
    const result = validatePattern('hello123', rule, context);
    
    expect(result).not.toBeNull();
    expect(result![0]).toEqual({
      code: ValidationErrorCode.PATTERN_MISMATCH,
      params: { 
        pattern: '^[a-zA-Z]+$', 
        value: 'hello123' 
      },
      context: { field: 'username', label: '用户名' }
    });
  });

  // 测试特殊字符
  it('should handle special characters in pattern', () => {
    const rule = { pattern: /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/ };
    const result = validatePattern('!@#$', rule);
    
    expect(result).toBeNull();
  });

  // 测试全局标志的正则
  it('should work with regex with global flag', () => {
    const rule = { pattern: /hello/gi };
    const result = validatePattern('HELLO world', rule);
    
    expect(result).toBeNull();
  });
});