import { InvalidInputError } from '../../error';
import { isString } from '../types';

/**
 * 模式断言函数
 * 这些函数用于断言字符串是否符合特定模式，验证失败时抛出 InvalidInputError
 */

/**
 * 断言字符串匹配正则表达式
 */
export function assertPattern(
  value: string,
  pattern: RegExp | string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
    caseSensitive?: boolean;
    global?: boolean;
    multiline?: boolean;
    ignoreCase?: boolean;
    sticky?: boolean;
    unicode?: boolean;
  }
): asserts value is string {
  const {
    paramName,
    functionName,
    message,
    caseSensitive = true,
    global = false,
    multiline = false,
    ignoreCase = false,
    sticky = false,
    unicode = false
  } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 构建正则表达式标志
  let flags = '';
  if (!caseSensitive || ignoreCase) {
    flags += 'i';
  }
  if (global) {
    flags += 'g';
  }
  if (multiline) {
    flags += 'm';
  }
  if (sticky) {
    flags += 'y';
  }
  if (unicode) {
    flags += 'u';
  }
  
  // 创建正则表达式
  const regex = pattern instanceof RegExp 
    ? new RegExp(pattern.source, flags)
    : new RegExp(pattern, flags);
  
  if (!regex.test(value)) {
    const patternText = pattern instanceof RegExp ? pattern.toString() : pattern;
    throw new InvalidInputError(
      message || `${paramText} must match pattern ${patternText}${functionText}`,
      { value, paramName, functionName, pattern: patternText } as any
    );
  }
}

/**
 * 断言有效的电子邮件地址
 */
export function assertEmail(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 电子邮件正则表达式
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a valid email address${functionText}`,
      { value, paramName, functionName, expected: 'valid email address' } as any
    );
  }
}

/**
 * 断言有效的电话号码
 */
export function assertPhone(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 移除所有空格和特殊字符
  const cleaned = value.replace(/[\s\-()]/g, '');
  
  // 国际号码格式（E.164）
  const internationalRegex = /^\+?[1-9]\d{1,14}$/;
  
  // 中国手机号格式
  const chineseMobileRegex = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
  
  // 中国座机号格式
  const chineseLandlineRegex = /^(?:(?:0\d{2,3})-)?\d{7,8}$/;
  
  if (
    !internationalRegex.test(cleaned) &&
    !chineseMobileRegex.test(value) &&
    !chineseLandlineRegex.test(value)
  ) {
    throw new InvalidInputError(
      message || `${paramText} must be a valid phone number${functionText}`,
      { value, paramName, functionName, expected: 'valid phone number' } as any
    );
  }
}

/**
 * 断言有效的URL
 */
export function assertURL(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  try {
    new URL(value);
  } catch {
    throw new InvalidInputError(
      message || `${paramText} must be a valid URL${functionText}`,
      { value, paramName, functionName, expected: 'valid URL' } as any
    );
  }
}

/**
 * 断言有效的IPv4地址
 */
export function assertIPv4(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  assertPattern(value, ipv4Regex, { paramName, functionName, message });
}

/**
 * 断言有效的IPv6地址
 */
export function assertIPv6(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  assertPattern(value, ipv6Regex, { paramName, functionName, message });
}

/**
 * 断言有效的MAC地址
 */
export function assertMAC(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  assertPattern(value, macRegex, { paramName, functionName, message });
}

/**
 * 断言有效的十六进制颜色值
 */
export function assertHexColor(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const hexColorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  assertPattern(value, hexColorRegex, { paramName, functionName, message });
}

/**
 * 断言有效的RGB颜色值
 */
export function assertRGBColor(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramName || 'Value'} must be a string`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  const match = value.match(rgbRegex);
  if (!match) {
    throw new InvalidInputError(
      message || `${paramName || 'Value'} must be a valid RGB color (e.g., rgb(255, 255, 255))`,
      { value, paramName, functionName, expected: 'RGB color' } as any
    );
  }
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new InvalidInputError(
      message || `${paramName || 'Value'} RGB values must be between 0 and 255`,
      { value, paramName, functionName, r, g, b } as any
    );
  }
}

/**
 * 断言有效的RGBA颜色值
 */
export function assertRGBAColor(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramName || 'Value'} must be a string`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  const match = value.match(rgbaRegex);
  if (!match) {
    throw new InvalidInputError(
      message || `${paramName || 'Value'} must be a valid RGBA color (e.g., rgba(255, 255, 255, 0.5))`,
      { value, paramName, functionName, expected: 'RGBA color' } as any
    );
  }
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = parseFloat(match[4]);
  
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
    throw new InvalidInputError(
      message || `${paramName || 'Value'} RGBA values must be valid (RGB: 0-255, A: 0-1)`,
      { value, paramName, functionName, r, g, b, a } as any
    );
  }
}

/**
 * 断言有效的用户名
 */
export function assertUsername(
  value: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowDigits?: boolean;
    allowUnderscore?: boolean;
    allowHyphen?: boolean;
    allowDot?: boolean;
    allowAt?: boolean;
    startWithLetter?: boolean;
    paramName?: string;
    functionName?: string;
    message?: string;
  } = {}
): asserts value is string {
  const {
    minLength = 3,
    maxLength = 20,
    allowDigits = true,
    allowUnderscore = true,
    allowHyphen = true,
    allowDot = false,
    allowAt = false,
    startWithLetter = true,
    paramName,
    functionName,
    message
  } = options;
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Username';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 检查长度
  if (value.length < minLength) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${minLength} characters long${functionText}`,
      { value, paramName, functionName, minLength, actualLength: value.length } as any
    );
  }
  
  if (value.length > maxLength) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${maxLength} characters long${functionText}`,
      { value, paramName, functionName, maxLength, actualLength: value.length } as any
    );
  }
  
  // 构建正则表达式
  let pattern = '^';
  
  // 开头字符
  if (startWithLetter) {
    pattern += '[a-zA-Z]';
  } else {
    pattern += '[a-zA-Z0-9]';
  }
  
  // 中间字符
  pattern += '[';
  pattern += 'a-zA-Z';
  if (allowDigits) pattern += '0-9';
  if (allowUnderscore) pattern += '_';
  if (allowHyphen) pattern += '-';
  if (allowDot) pattern += '\\.';
  if (allowAt) pattern += '@';
  pattern += ']*';
  
  pattern += '$';
  
  assertPattern(value, new RegExp(pattern), { 
    paramName, 
    functionName, 
    message: message || `${paramText} must match the username pattern${functionText}` 
  });
}

/**
 * 断言有效的密码
 */
export function assertPassword(
  value: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigits?: boolean;
    requireSpecial?: boolean;
    paramName?: string;
    functionName?: string;
    message?: string;
  } = {}
): asserts value is string {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigits = true,
    requireSpecial = false,
    paramName,
    functionName,
    message
  } = options;
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Password';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 检查长度
  if (value.length < minLength) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${minLength} characters long${functionText}`,
      { value, paramName, functionName, minLength, actualLength: value.length } as any
    );
  }
  
  const errors: string[] = [];
  
  if (requireUppercase && !/[A-Z]/.test(value)) {
    errors.push('uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(value)) {
    errors.push('lowercase letter');
  }
  
  if (requireDigits && !/\d/.test(value)) {
    errors.push('digit');
  }
  
  if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    errors.push('special character');
  }
  
  if (errors.length > 0) {
    throw new InvalidInputError(
      message || `${paramText} must contain at least one ${errors.join(', ')}${functionText}`,
      { value, paramName, functionName, missing: errors } as any
    );
  }
}

/**
 * 断言有效的身份证号码（中国）
 */
export function assertChineseID(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 基本格式验证
  const idRegex = /^\d{17}[\dXx]$/;
  if (!idRegex.test(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a valid Chinese ID number${functionText}`,
      { value, paramName, functionName, expected: 'Chinese ID number' } as any
    );
  }
  
  // 校验位验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(value.charAt(i), 10) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  if (value.charAt(17).toUpperCase() !== checkCode) {
    throw new InvalidInputError(
      message || `${paramText} has invalid check code${functionText}`,
      { value, paramName, functionName, expectedCheckCode: checkCode, actualCheckCode: value.charAt(17) } as any
    );
  }
}

/**
 * 断言有效的邮政编码（中国）
 */
export function assertChinesePostcode(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const postcodeRegex = /^[1-9]\d{5}$/;
  assertPattern(value, postcodeRegex, { paramName, functionName, message });
}

/**
 * 断言有效的日期字符串（YYYY-MM-DD格式）
 */
export function assertDateString(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be in YYYY-MM-DD format${functionText}`,
      { value, paramName, functionName, expectedFormat: 'YYYY-MM-DD' } as any
    );
  }
  
  // 验证日期有效性
  const [year, month, day] = value.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    throw new InvalidInputError(
      message || `${paramText} is not a valid date${functionText}`,
      { value, paramName, functionName, year, month, day } as any
    );
  }
}

/**
 * 断言有效的时间字符串（HH:MM:SS格式）
 */
export function assertTimeString(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  assertPattern(value, timeRegex, { paramName, functionName, message });
}

/**
 * 断言有效的日期时间字符串（YYYY-MM-DD HH:MM:SS格式）
 */
export function assertDateTimeString(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  const [datePart, timePart] = value.split(' ');
  
  if (!datePart || !timePart) {
    throw new InvalidInputError(
      message || `${paramText} must be in YYYY-MM-DD HH:MM:SS format${functionText}`,
      { value, paramName, functionName, expectedFormat: 'YYYY-MM-DD HH:MM:SS' } as any
    );
  }
  
  try {
    assertDateString(datePart, { paramName, functionName, message });
    assertTimeString(timePart, { paramName, functionName, message });
  } catch (error) {
    if (error instanceof InvalidInputError) {
      throw error;
    }
    throw new InvalidInputError(
      message || `${paramText} must be a valid date-time string${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言有效的JSON字符串
 */
export function assertJSONString(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  try {
    JSON.parse(value);
  } catch {
    throw new InvalidInputError(
      message || `${paramText} must be a valid JSON string${functionText}`,
      { value, paramName, functionName, expected: 'valid JSON' } as any
    );
  }
}

/**
 * 断言有效的Base64字符串
 */
export function assertBase64(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  assertPattern(value, base64Regex, { paramName, functionName, message });
}

/**
 * 断言有效的UUID
 */
export function assertUUID(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assertPattern(value, uuidRegex, { paramName, functionName, message });
}

/**
 * 断言有效的信用卡号码（Luhn算法）
 */
export function assertCreditCard(
  value: string,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): asserts value is string {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isString(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a string${functionText}`,
      { value, paramName, functionName, expected: 'string' } as any
    );
  }
  
  // 移除空格和连字符
  const cleaned = value.replace(/[\s-]/g, '');
  
  // 检查是否全为数字
  if (!/^\d+$/.test(cleaned)) {
    throw new InvalidInputError(
      message || `${paramText} must contain only digits${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  // Luhn算法验证
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  if (sum % 10 !== 0) {
    throw new InvalidInputError(
      message || `${paramText} is not a valid credit card number${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 创建自定义模式断言器
 */
export function createPatternAssertion(
  pattern: RegExp | string,
  defaultMessage?: string,
  options?: {
    caseSensitive?: boolean;
    global?: boolean;
    multiline?: boolean;
    ignoreCase?: boolean;
    sticky?: boolean;
    unicode?: boolean;
  }
) {
  return (
    value: string,
    customOptions?: {
      paramName?: string;
      functionName?: string;
      message?: string;
    }
  ): asserts value is string => {
    const { paramName, functionName, message } = customOptions || {};
    const finalMessage = message || defaultMessage || 'must match pattern';
    
    assertPattern(value, pattern, {
      paramName,
      functionName,
      message: finalMessage,
      ...options
    });
  };
}
