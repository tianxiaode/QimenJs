import { isString } from '../types';

/**
 * 正则表达式验证函数
 */

/**
 * 使用正则表达式验证字符串
 */
export function validatePattern(
  value: string,
  pattern: RegExp | string
): boolean {
  if (!isString(value)) {
    return false;
  }
  
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return regex.test(value);
}

/**
 * 验证电子邮件地址
 */
export function validateEmail(email: string): boolean {
  // 标准电子邮件正则表达式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return validatePattern(email, emailRegex);
}

/**
 * 验证电话号码
 * 支持国际格式、国内手机号、座机号
 */
export function validatePhone(phone: string): boolean {
  // 移除所有空格和特殊字符，只保留数字和+
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // 国际号码格式
  const internationalRegex = /^\+?[1-9]\d{1,14}$/;
  
  // 中国手机号格式
  const chineseMobileRegex = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
  
  // 中国座机号格式
  const chineseLandlineRegex = /^(?:(?:0\d{2,3})-)?\d{7,8}$/;
  
  return (
    validatePattern(cleaned, internationalRegex) ||
    validatePattern(phone, chineseMobileRegex) ||
    validatePattern(phone, chineseLandlineRegex)
  );
}

/**
 * 验证URL地址
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证IPv4地址
 */
export function validateIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return validatePattern(ip, ipv4Regex);
}

/**
 * 验证IPv6地址
 */
export function validateIPv6(ip: string): boolean {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return validatePattern(ip, ipv6Regex);
}

/**
 * 验证MAC地址
 */
export function validateMAC(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return validatePattern(mac, macRegex);
}

/**
 * 验证十六进制颜色值
 */
export function validateHexColor(color: string): boolean {
  const hexColorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  return validatePattern(color, hexColorRegex);
}

/**
 * 验证身份证号（中国）
 */
export function validateChineseID(id: string): boolean {
  const idRegex = /^\d{17}[\dXx]$/;
  if (!validatePattern(id, idRegex)) {
    return false;
  }
  
  // 校验位验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id.charAt(i), 10) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  return id.charAt(17).toUpperCase() === checkCode;
}

/**
 * 验证邮政编码（中国）
 */
export function validateChinesePostcode(postcode: string): boolean {
  const postcodeRegex = /^[1-9]\d{5}$/;
  return validatePattern(postcode, postcodeRegex);
}

/**
 * 验证用户名
 * @param username 用户名
 * @param options 选项：minLength, maxLength, allowDigits, allowSpecialChars
 */
export function validateUsername(
  username: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowDigits?: boolean;
    allowSpecialChars?: boolean;
  } = {}
): boolean {
  const {
    minLength = 3,
    maxLength = 20,
    allowDigits = true,
    allowSpecialChars = false
  } = options;
  
  if (!isString(username)) {
    return false;
  }
  
  if (username.length < minLength || username.length > maxLength) {
    return false;
  }
  
  // 构建正则表达式
  let pattern = '^';
  if (allowSpecialChars) {
    pattern += '[a-zA-Z0-9_\\-\\.@]+';
  } else if (allowDigits) {
    pattern += '[a-zA-Z0-9_]+';
  } else {
    pattern += '[a-zA-Z_]+';
  }
  pattern += '$';
  
  return validatePattern(username, new RegExp(pattern));
}

/**
 * 验证密码强度
 * @param password 密码
 * @param options 选项：minLength, requireUppercase, requireLowercase, requireDigits, requireSpecial
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigits?: boolean;
    requireSpecial?: boolean;
  } = {}
): boolean {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigits = true,
    requireSpecial = false
  } = options;
  
  if (!isString(password) || password.length < minLength) {
    return false;
  }
  
  let score = 0;
  
  // 检查大写字母
  if (!requireUppercase || /[A-Z]/.test(password)) {
    score++;
  }
  
  // 检查小写字母
  if (!requireLowercase || /[a-z]/.test(password)) {
    score++;
  }
  
  // 检查数字
  if (!requireDigits || /\d/.test(password)) {
    score++;
  }
  
  // 检查特殊字符
  if (!requireSpecial || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  }
  
  // 所有必需条件都满足
  return score === 4;
}

/**
 * 创建自定义正则验证器
 */
export function createPatternValidator(pattern: RegExp | string) {
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  
  return function(value: string): boolean {
    return validatePattern(value, regex);
  };
}