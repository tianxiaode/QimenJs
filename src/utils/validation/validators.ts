import { isArray, isFunction, isBoolean, isNumber, isInteger,isString, isEmptyString,isObject,isEmptyArray  } from './types';

/**
 * 验证器函数 - 返回布尔值
 */

/**
 * 验证数组并返回布尔值
 */
export function validateArray(
  value: any, 
  paramName?: string, 
  functionName?: string
): value is any[] {
  return isArray(value);
}

/**
 * 验证函数并返回布尔值
 */
export function validateFunction(
  value: any, 
  paramName?: string, 
  functionName?: string
): value is Function {
  return isFunction(value);
}

/**
 * 验证数字并返回布尔值
 */
export function validateNumber(
  value: any, 
  paramName?: string, 
  functionName?: string,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
  }
): value is number {
  if (!isNumber(value)) {
    return false;
  }
  
  const { min, max, integer, positive } = options || {};
  
  if (integer !== undefined && !isInteger(value)) {
    return false;
  }
  
  if (positive !== undefined && value <= 0) {
    return false;
  }
  
  if (min !== undefined && value < min) {
    return false;
  }
  
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
}

/**
 * 验证字符串并返回布尔值
 */
export function validateString(
  value: any, 
  paramName?: string, 
  functionName?: string,
  options?: {
    nonEmpty?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }
): value is string {
  if (!isString(value)) {
    return false;
  }
  
  const { nonEmpty, minLength, maxLength, pattern } = options || {};
  
  if (nonEmpty && isEmptyString(value)) {
    return false;
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return false;
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return false;
  }
  
  if (pattern !== undefined && !pattern.test(value)) {
    return false;
  }
  
  return true;
}

/**
 * 验证对象并返回布尔值
 */
export function validateObject(
  value: any, 
  paramName?: string, 
  functionName?: string
): value is Record<string, any> {
  return isObject(value);
}

/**
 * 验证数组不为空并返回布尔值
 */
export function validateNonEmptyArray<T>(
  value: T[], 
  paramName?: string, 
  functionName?: string
): value is [T, ...T[]] {
  return isArray(value) && !isEmptyArray(value);
}

/**
 * 验证值在范围内并返回布尔值
 */
export function validateInRange(
  value: number,
  min: number,
  max: number,
  paramName?: string,
  functionName?: string
): boolean {
  return isNumber(value) && value >= min && value <= max;
}

/**
 * 验证值在选项中并返回布尔值
 */
export function validateOneOf<T>(
  value: any,
  allowedValues: T[],
  paramName?: string,
  functionName?: string
): value is T {
  return allowedValues.includes(value);
}

/**
 * 验证邮件地址格式并返回布尔值
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/** 验证电话号码格式并返回布尔值
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/** 验证URL格式并返回布尔值
 */
export function validateURL(url: string): boolean { 
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
}

/** 验证JSON字符串格式并返回布尔值
 */
export function validateJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}        