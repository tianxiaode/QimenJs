// patterns.ts
import { ValidationErrorCode, ValidationErrorParams } from '../rules/error-codes';
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
  validateDateTime,
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
  } & AssertErrorContextOptions = {}
): asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validatePattern(value, pattern, validationOptions)) {
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
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateEmail(value)) {
    ctx.throwError(ValidationErrorCode.EMAIL_INVALID, { value });
  }
}

/**
 * 电话号码断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertPhone(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validatePhone(value)) {
    ctx.throwError(ValidationErrorCode.PHONE_INVALID, { value });
  }
}

/**
 * URL断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertURL(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateURL(value)) {
    ctx.throwError(ValidationErrorCode.URL_INVALID, { value });
  }
}

/**
 * IPv4地址断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertIPv4(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateIPv4(value)) {
    ctx.throwError(ValidationErrorCode.IPV4_INVALID, { value });
  }
}

/**
 * IPv6地址断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertIPv6(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateIPv6(value)) {
    ctx.throwError(ValidationErrorCode.IPV6_INVALID, { value });
  }
}

/**
 * MAC地址断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMAC(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateMAC(value)) {
    ctx.throwError(ValidationErrorCode.MAC_INVALID, { value });
  }
}

/**
 * 十六进制颜色值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertHexColor(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateHexColor(value)) {
    ctx.throwError(ValidationErrorCode.HEX_COLOR_INVALID, { value });
  }
}

/**
 * RGB颜色值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRGBColor(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateRGBColor(value)) {
    ctx.throwError(ValidationErrorCode.RGB_COLOR_INVALID, { value });
  }
}

/**
 * RGBA颜色值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRGBAColor(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateRGBAColor(value)) {
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
  } & AssertErrorContextOptions = {}
): asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateUsername(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.USERNAME_INVALID, { value });
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
  } & AssertErrorContextOptions = {}
): asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validatePassword(value, validationOptions)) {
    ctx.throwError(ValidationErrorCode.PASSWORD_INVALID, { value });
  }
}

/**
 * 身份证号码（中国）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertChineseID(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateChineseID(value)) {
    ctx.throwError(ValidationErrorCode.CHINESE_ID_INVALID, { value });
  }
}

/**
 * 邮政编码（中国）断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertChinesePostcode(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateChinesePostcode(value)) {
    ctx.throwError(ValidationErrorCode.CHINESE_POSTCODE_INVALID, { value });
  }
}

/**
 * 日期时间断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertDateTime(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateDateTime(value)) {
    ctx.throwError(ValidationErrorCode.DATETIME_INVALID, { value });
  }
}

/**
 * JSON字符串断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertJSONString(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateJSONString(value)) {
    ctx.throwError(ValidationErrorCode.JSON_STRING_INVALID, { value });
  }
}

/**
 * Base64字符串断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBase64(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateBase64(value)) {
    ctx.throwError(ValidationErrorCode.BASE64_INVALID, { value });
  }
}

/**
 * UUID断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertUUID(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateUUID(value)) {
    ctx.throwError(ValidationErrorCode.UUID_INVALID, { value });
  }
}

/**
 * 信用卡号码断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertCreditCard(
  value: any,
  options: AssertErrorContextOptions = {}
): asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateCreditCard(value)) {
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
  } & AssertErrorContextOptions = {}
): (value: any) => asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): asserts value is string => {
    if (!validatePattern(value, pattern, validationOptions)) {
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
  } & AssertErrorContextOptions = {}
): (value: any) => asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): asserts value is string => {
    if (!validateUsername(value, validationOptions)) {
      ctx.throwError(ValidationErrorCode.USERNAME_INVALID, { value });
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
  } & AssertErrorContextOptions = {}
): (value: any) => asserts value is string {
  const { 
    paramName, 
    functionName,
    ...validationOptions 
  } = options;
  
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): asserts value is string => {
    if (!validatePassword(value, validationOptions)) {
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
  options: AssertErrorContextOptions = {}
): (value: any) => asserts value is string {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): asserts value is string => {
    if (!patternValidationChain(value, validators)) {
      ctx.throwError(errorCode, { value });
    }
  };
}