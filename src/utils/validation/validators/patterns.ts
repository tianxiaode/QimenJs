// patterns.ts
import { isString } from '../types';

/**
 * 模式验证函数
 * 这些函数用于验证字符串是否符合特定模式（正则表达式）
 */

/**
 * 验证字符串是否匹配正则表达式
 * @param value 要验证的值
 * @param pattern 正则表达式或字符串模式
 * @param options 验证选项
 */
export function validatePattern(
  value: string,
  pattern: RegExp | string,
  options: {
    caseSensitive?: boolean;      // 是否区分大小写
    global?: boolean;             // 是否全局匹配
    multiline?: boolean;          // 是否多行匹配
    ignoreCase?: boolean;         // 是否忽略大小写
    sticky?: boolean;             // 是否粘性匹配
    unicode?: boolean;            // 是否启用 Unicode 模式
  } = {}
): boolean {
  if (!isString(value)) {
    return false;
  }
  
  const {
    caseSensitive = true,
    global = false,
    multiline = false,
    ignoreCase = false,
    sticky = false,
    unicode = false
  } = options;
  
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
  
  return regex.test(value);
}

/**
 * 验证电子邮件地址
 * @param email 要验证的电子邮件地址
 */
export function validateEmail(email: string): boolean {
  if (!isString(email)) {
    return false;
  }
  
  // 比较全面的电子邮件正则表达式
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return validatePattern(email, emailRegex);
}

/**
 * 验证电话号码
 * 支持国际格式和国内手机号
 * @param phone 要验证的电话号码
 */
export function validatePhone(phone: string): boolean {
  if (!isString(phone)) {
    return false;
  }
  
  // 移除所有空格和特殊字符，但保留数字和+
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // 如果清理后的字符串为空或太短，则无效
  if (cleaned.length < 3) {
    return false;
  }
  
  // 中国手机号格式
  const chineseMobileRegex = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
  
  // 中国座机号格式（原始格式）
  const chineseLandlineRegex = /^(?:(?:0\d{2,3})-)?\d{7,8}$/;
  
  // 中国座机号格式（清理后格式）
  const chineseLandlineCleanedRegex = /^(0\d{2,3})?\d{7,8}$/;
  
  // 国际号码格式（E.164）- 必须以+开头且至少8位数字
  const internationalRegex = /^\+[1-9]\d{7,14}$/;
  
  return (
    validatePattern(phone, chineseMobileRegex) ||
    validatePattern(phone, chineseLandlineRegex) ||
    validatePattern(cleaned, chineseLandlineCleanedRegex) ||
    validatePattern(cleaned, internationalRegex)
  );
}

/**
 * 验证URL地址
 * @param url 要验证的URL
 */
export function validateURL(url: string): boolean {
  if (!isString(url)) {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证IPv4地址
 * @param ip 要验证的IP地址
 */
export function validateIPv4(ip: string): boolean {
  if (!isString(ip)) {
    return false;
  }
  
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return validatePattern(ip, ipv4Regex);
}

/**
 * 验证IPv6地址
 * @param ip 要验证的IP地址
 */
export function validateIPv6(ip: string): boolean {
  if (!isString(ip)) {
    return false;
  }
  
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return validatePattern(ip, ipv6Regex);
}

/**
 * 验证MAC地址
 * @param mac 要验证的MAC地址
 */
export function validateMAC(mac: string): boolean {
  if (!isString(mac)) {
    return false;
  }
  
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return validatePattern(mac, macRegex);
}

/**
 * 验证十六进制颜色值
 * @param color 要验证的颜色值
 */
export function validateHexColor(color: string): boolean {
  if (!isString(color)) {
    return false;
  }
  
  const hexColorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  return validatePattern(color, hexColorRegex);
}

/**
 * 验证RGB颜色值
 * @param color 要验证的颜色值
 */
export function validateRGBColor(color: string): boolean {
  if (!isString(color)) {
    return false;
  }
  
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  
  // 提取RGB值并验证范围
  const match = color.match(rgbRegex);
  if (!match) return false;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
}

/**
 * 验证RGBA颜色值
 * @param color 要验证的颜色值
 */
export function validateRGBAColor(color: string): boolean {
  if (!isString(color)) {
    return false;
  }
  
  const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  
  // 提取RGBA值并验证范围
  const match = color.match(rgbaRegex);
  if (!match) return false;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = parseFloat(match[4]);
  
  return r >= 0 && r <= 255 && 
         g >= 0 && g <= 255 && 
         b >= 0 && b <= 255 && 
         a >= 0 && a <= 1;
}

/**
 * 验证用户名
 * @param username 要验证的用户名
 * @param options 验证选项
 */
export function validateUsername(
  username: string,
  options: {
    minLength?: number;          // 最小长度
    maxLength?: number;          // 最大长度
    allowDigits?: boolean;       // 是否允许数字
    allowUnderscore?: boolean;   // 是否允许下划线
    allowHyphen?: boolean;       // 是否允许连字符
    allowDot?: boolean;          // 是否允许点
    allowAt?: boolean;           // 是否允许@符号
    startWithLetter?: boolean;   // 是否必须以字母开头
  } = {}
): boolean {
  if (!isString(username)) {
    return false;
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
  if (username.length < minLength || username.length > maxLength) {
    return false;
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
  if (allowHyphen) pattern += '\\-';  // 修复：正确转义连字符
  if (allowDot) pattern += '\\.';     // 修复：正确转义点号
  if (allowAt) pattern += '@';
  pattern += ']*';
  
  pattern += '$';
  
  return validatePattern(username, new RegExp(pattern));
}

/**
 * 验证密码强度
 * @param password 要验证的密码
 * @param options 验证选项
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;          // 最小长度
    requireUppercase?: boolean;  // 是否需要大写字母
    requireLowercase?: boolean;  // 是否需要小写字母
    requireDigits?: boolean;     // 是否需要数字
    requireSpecial?: boolean;    // 是否需要特殊字符
  } = {}
): boolean {
  if (!isString(password)) {
    return false;
  }
  
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigits = true,
    requireSpecial = false
  } = options;
  
  // 检查长度
  if (password.length < minLength) {
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
 * 验证身份证号码（中国）
 * @param id 要验证的身份证号码
 */
export function validateChineseID(id: string): boolean {
  if (!isString(id)) {
    return false;
  }
  
  // 基本格式验证
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
 * @param postcode 要验证的邮政编码
 */
export function validateChinesePostcode(postcode: string): boolean {
  if (!isString(postcode)) {
    return false;
  }
  
  const postcodeRegex = /^[1-9]\d{5}$/;
  return validatePattern(postcode, postcodeRegex);
}

/**
 * 验证日期时间是否有效
 * @param datetime 要验证的日期时间值
 * @returns boolean 表示日期时间是否有效
 */
export function validateDateTime(datetime: any): boolean {
  // 处理 null/undefined
  if (datetime === null || datetime === undefined) {
    return false;
  }
  
  // 直接使用 Date 构造函数验证
  const date = new Date(datetime);
  
  // 检查是否是有效日期
  return !isNaN(date.getTime());
}

/**
 * 验证JSON字符串
 * @param json 要验证的JSON字符串
 */
export function validateJSONString(json: string): boolean {
  if (!isString(json)) {
    return false;
  }
  
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证Base64字符串
 * @param base64 要验证的Base64字符串
 */
export function validateBase64(base64: string): boolean {
  if (!isString(base64)) {
    return false;
  }
  
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return validatePattern(base64, base64Regex);
}

/**
 * 验证UUID（通用唯一识别码）
 * @param uuid 要验证的UUID
 */
export function validateUUID(uuid: string): boolean {
  if (!isString(uuid)) {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return validatePattern(uuid, uuidRegex);
}

/**
 * 验证信用卡号码（Luhn算法）
 * @param cardNumber 要验证的信用卡号码
 */
export function validateCreditCard(cardNumber: string): boolean {
  if (!isString(cardNumber)) {
    return false;
  }
  
  // 移除空格和连字符
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // 检查是否全为数字
  if (!/^\d+$/.test(cleaned)) {
    return false;
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
  
  return sum % 10 === 0;
}

/**
 * 创建自定义模式验证器
 * @param pattern 正则表达式或字符串模式
 * @param options 验证选项
 */
export function createPatternValidator(
  pattern: RegExp | string,
  options: {
    caseSensitive?: boolean;
    global?: boolean;
    multiline?: boolean;
    ignoreCase?: boolean;
    sticky?: boolean;
    unicode?: boolean;
  } = {}
) {
  return (value: string): boolean => {
    return validatePattern(value, pattern, options);
  };
}