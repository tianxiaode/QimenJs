import { ValidationErrorCode, ValidationErrorParams } from './error-codes';
import { createAssetErrorContext, AssertErrorContextOptions } from './error-context';
import {
  validatePattern,
  validateEmail,
  validatePhone,
  validateURL,
  validateIPv4,
  validateIPv6,
  validateMAC,
  validateHexColor,
  validateRGBColor,
  validateRGBAColor,
  validateUsername,
  validatePassword,
  validateChineseID,
  validateChinesePostcode,
  validateDateString,
  validateTimeString,
  validateDateTimeString,
  validateJSONString,
  validateBase64,
  validateUUID,
  validateCreditCard,
  createPatternValidator
} from '../validators';

/**
 * 模式匹配断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPattern(
  value: any,
  pattern: RegExp | string,
  options: {
    caseSensitive?: boolean;
    global?: boolean;
    multiline?: boolean;
    ignoreCase?: boolean;
    sticky?: boolean;
    unicode?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validatePattern(value, pattern, options)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    const patternText = pattern instanceof RegExp ? pattern.source : pattern;
    ctx.throwError(ValidationErrorCode.PATTERN_MISMATCH, { 
      pattern: patternText,
      patternText: `正则表达式: ${patternText}`,
      value
    });
  }
}

/**
 * 电子邮件断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmail(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEmail(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.EMAIL_INVALID, { value });
  }
}

/**
 * 电话号码断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPhone(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validatePhone(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.PHONE_INVALID, { value });
  }
}

/**
 * URL断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertURL(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateURL(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.URL_INVALID, { value });
  }
}

/**
 * IPv4地址断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertIPv4(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateIPv4(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.IPV4_INVALID, { value });
  }
}

/**
 * IPv6地址断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertIPv6(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateIPv6(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.IPV6_INVALID, { value });
  }
}

/**
 * MAC地址断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMAC(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateMAC(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.MAC_INVALID, { value });
  }
}

/**
 * 十六进制颜色值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertHexColor(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateHexColor(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.HEX_COLOR_INVALID, { value });
  }
}

/**
 * RGB颜色值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRGBColor(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateRGBColor(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.RGB_COLOR_INVALID, { value });
  }
}

/**
 * RGBA颜色值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRGBAColor(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateRGBAColor(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.RGBA_COLOR_INVALID, { value });
  }
}

/**
 * 用户名断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertUsername(
  value: any,
  options: {
    minLength?: number;
    maxLength?: number;
    allowDigits?: boolean;
    allowUnderscore?: boolean;
    allowHyphen?: boolean;
    allowDot?: boolean;
    allowAt?: boolean;
    startWithLetter?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateUsername(value, options)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    const {
      minLength = 3,
      maxLength = 20,
      allowDigits = true,
      allowUnderscore = true,
      allowHyphen = true,
      allowDot = false,
      allowAt = false,
      startWithLetter = true
    } = options;
    
    // 检查长度
    if (value.length < minLength) {
      ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
        min: minLength, 
        actualLength: value.length 
      });
    }
    
    if (value.length > maxLength) {
      ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
        max: maxLength, 
        actualLength: value.length 
      });
    }
    
    // 构建模式描述
    const patternParts = [];
    if (startWithLetter) patternParts.push('字母开头');
    if (allowDigits) patternParts.push('允许数字');
    if (allowUnderscore) patternParts.push('允许下划线');
    if (allowHyphen) patternParts.push('允许连字符');
    if (allowDot) patternParts.push('允许点');
    if (allowAt) patternParts.push('允许@');
    
    const patternText = patternParts.length > 0 ? patternParts.join(', ') : '无限制';
    
    ctx.throwError(ValidationErrorCode.USERNAME_INVALID, { 
      value,
      minLength,
      maxLength,
      patternText
    });
  }
}

/**
 * 密码强度断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPassword(
  value: any,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigits?: boolean;
    requireSpecial?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validatePassword(value, options)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireDigits = true,
      requireSpecial = false
    } = options;
    
    // 检查长度
    if (value.length < minLength) {
      ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
        min: minLength, 
        actualLength: value.length 
      });
    }
    
    // 检查具体要求
    const missingRequirements: string[] = [];
    
    if (requireUppercase && !/[A-Z]/.test(value)) {
      missingRequirements.push('大写字母');
    }
    
    if (requireLowercase && !/[a-z]/.test(value)) {
      missingRequirements.push('小写字母');
    }
    
    if (requireDigits && !/\d/.test(value)) {
      missingRequirements.push('数字');
    }
    
    if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      missingRequirements.push('特殊字符');
    }
    
    if (missingRequirements.length > 0) {
      ctx.throwError(ValidationErrorCode.PASSWORD_INVALID, { 
        value,
        minLength,
        missingRequirements: missingRequirements.join(', ')
      });
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.PASSWORD_INVALID, { value });
  }
}

/**
 * 身份证号码（中国）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertChineseID(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateChineseID(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.CHINESE_ID_INVALID, { value });
  }
}

/**
 * 邮政编码（中国）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertChinesePostcode(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateChinesePostcode(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.CHINESE_POSTCODE_INVALID, { value });
  }
}

/**
 * 日期字符串（YYYY-MM-DD格式）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertDateString(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateDateString(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    // 检查格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      ctx.throwError(ValidationErrorCode.DATE_STRING_INVALID, { 
        value,
        expected: 'YYYY-MM-DD格式'
      });
    }
    
    // 检查日期有效性
    const [year, month, day] = value.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    if (dateObj.getFullYear() !== year || 
        dateObj.getMonth() !== month - 1 || 
        dateObj.getDate() !== day) {
      ctx.throwError(ValidationErrorCode.DATE_STRING_INVALID, { 
        value,
        reason: '无效的日期'
      });
    }
    
    ctx.throwError(ValidationErrorCode.DATE_STRING_INVALID, { value });
  }
}

/**
 * 时间字符串（HH:MM:SS格式）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertTimeString(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateTimeString(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.TIME_STRING_INVALID, { 
      value,
      expected: 'HH:MM:SS格式'
    });
  }
}

/**
 * 日期时间字符串（YYYY-MM-DD HH:MM:SS格式）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertDateTimeString(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateDateTimeString(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.DATETIME_STRING_INVALID, { 
      value,
      expected: 'YYYY-MM-DD HH:MM:SS格式'
    });
  }
}

/**
 * JSON字符串断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertJSONString(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateJSONString(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    // 尝试解析以获取更具体的错误信息
    try {
      JSON.parse(value);
    } catch (error: any) {
      ctx.throwError(ValidationErrorCode.JSON_STRING_INVALID, { 
        value,
        reason: error.message
      });
    }
    
    ctx.throwError(ValidationErrorCode.JSON_STRING_INVALID, { value });
  }
}

/**
 * Base64字符串断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBase64(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateBase64(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.BASE64_INVALID, { value });
  }
}

/**
 * UUID断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertUUID(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateUUID(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.UUID_INVALID, { value });
  }
}

/**
 * 信用卡号码断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertCreditCard(
  value: any,
  contextOptions?: AssertErrorContextOptions
): asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateCreditCard(value)) {
    // 检查是否是字符串
    if (typeof value !== 'string') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
    }
    
    ctx.throwError(ValidationErrorCode.CREDIT_CARD_INVALID, { value });
  }
}

/**
 * 创建自定义模式断言器
 */
export function createPatternAssert(
  pattern: RegExp | string,
  options: {
    caseSensitive?: boolean;
    global?: boolean;
    multiline?: boolean;
    ignoreCase?: boolean;
    sticky?: boolean;
    unicode?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is string => {
    if (!validatePattern(value, pattern, options)) {
      // 检查是否是字符串
      if (typeof value !== 'string') {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
      }
      
      const patternText = pattern instanceof RegExp ? pattern.source : pattern;
      ctx.throwError(ValidationErrorCode.PATTERN_MISMATCH, { 
        pattern: patternText,
        patternText: `正则表达式: ${patternText}`,
        value
      });
    }
  };
}

/**
 * 创建用户名断言器
 */
export function createUsernameAssert(
  options: {
    minLength?: number;
    maxLength?: number;
    allowDigits?: boolean;
    allowUnderscore?: boolean;
    allowHyphen?: boolean;
    allowDot?: boolean;
    allowAt?: boolean;
    startWithLetter?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is string => {
    if (!validateUsername(value, options)) {
      // 检查是否是字符串
      if (typeof value !== 'string') {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
      }
      
      const {
        minLength = 3,
        maxLength = 20,
        allowDigits = true,
        allowUnderscore = true,
        allowHyphen = true,
        allowDot = false,
        allowAt = false,
        startWithLetter = true
      } = options;
      
      // 检查长度
      if (value.length < minLength) {
        ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
          min: minLength, 
          actualLength: value.length 
        });
      }
      
      if (value.length > maxLength) {
        ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
          max: maxLength, 
          actualLength: value.length 
        });
      }
      
      // 构建模式描述
      const patternParts = [];
      if (startWithLetter) patternParts.push('字母开头');
      if (allowDigits) patternParts.push('允许数字');
      if (allowUnderscore) patternParts.push('允许下划线');
      if (allowHyphen) patternParts.push('允许连字符');
      if (allowDot) patternParts.push('允许点');
      if (allowAt) patternParts.push('允许@');
      
      const patternText = patternParts.length > 0 ? patternParts.join(', ') : '无限制';
      
      ctx.throwError(ValidationErrorCode.USERNAME_INVALID, { 
        value,
        minLength,
        maxLength,
        patternText
      });
    }
  };
}

/**
 * 创建密码强度断言器
 */
export function createPasswordAssert(
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigits?: boolean;
    requireSpecial?: boolean;
  } = {},
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is string => {
    if (!validatePassword(value, options)) {
      // 检查是否是字符串
      if (typeof value !== 'string') {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
      }
      
      const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireDigits = true,
        requireSpecial = false
      } = options;
      
      // 检查长度
      if (value.length < minLength) {
        ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
          min: minLength, 
          actualLength: value.length 
        });
      }
      
      // 检查具体要求
      const missingRequirements: string[] = [];
      
      if (requireUppercase && !/[A-Z]/.test(value)) {
        missingRequirements.push('大写字母');
      }
      
      if (requireLowercase && !/[a-z]/.test(value)) {
        missingRequirements.push('小写字母');
      }
      
      if (requireDigits && !/\d/.test(value)) {
        missingRequirements.push('数字');
      }
      
      if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        missingRequirements.push('特殊字符');
      }
      
      if (missingRequirements.length > 0) {
        ctx.throwError(ValidationErrorCode.PASSWORD_INVALID, { 
          value,
          minLength,
          missingRequirements: missingRequirements.join(', ')
        });
      }
      
      // 未知原因
      ctx.throwError(ValidationErrorCode.PASSWORD_INVALID, { value });
    }
  };
}

/**
 * 组合模式断言：验证多个模式条件
 */
export function assertPatterns(
  value: any,
  assertions: Array<(value: any) => void>
): void {
  for (const assertion of assertions) {
    assertion(value);
  }
}

/**
 * 条件模式断言：仅当条件满足时才执行断言
 */
export function conditionalPatternAssert(
  condition: boolean,
  assertion: (value: any) => void,
  value: any
): void {
  if (condition) {
    assertion(value);
  }
}

/**
 * 模式验证链：依次验证多个模式，第一个失败则停止
 */
export function patternValidationChain(
  value: any,
  validators: Array<(value: any) => boolean>
): boolean {
  for (const validator of validators) {
    if (!validator(value)) {
      return false;
    }
  }
  return true;
}

/**
 * 创建模式验证链断言器
 */
export function createPatternValidationChainAssert(
  validators: Array<(value: any) => boolean>,
  errorCode: ValidationErrorCode = ValidationErrorCode.PATTERN_MISMATCH,
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is string {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is string => {
    if (!patternValidationChain(value, validators)) {
      // 检查是否是字符串
      if (typeof value !== 'string') {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_STRING);
      }
      
      ctx.throwError(errorCode, { value });
    }
  };
}