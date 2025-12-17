import { ValidationErrorCode,ValidationResult } from '../../core';

/**
 * 字符串验证规则的配置接口
 * 用于创建字符串验证器的配置选项
 */
export interface StringValidationOptions {
  /** 是否为必填字段 */
  required?: boolean;
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 精确长度 */
  exactLength?: number;
  /** 正则表达式模式 */
  pattern?: RegExp | string;
  /** 自定义错误消息 */
  message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 是否在验证前去除空白字符 */
  trim?: boolean;
  /** 转换为小写后验证 */
  toLowerCase?: boolean;
  /** 转换为大写后验证 */
  toUpperCase?: boolean;
  /** 自定义验证函数 */
  custom?: (value: string) => ValidationResult;
  /** 仅验证非空字符串（空字符串跳过验证） */
  skipIfEmpty?: boolean;

  // 新增的预定义验证选项
  /** 验证是否为有效的电子邮件地址 */
  email?: boolean;
  /** 验证是否为有效的URL */
  url?: boolean;
  /** 验证是否为有效的手机号码 */
  phone?: boolean;
  /** 验证是否为数值字符串 */
  numeric?: boolean;
  /** 验证是否为整数字符串 */
  integerString?: boolean;
  /** 验证是否为有效的用户名格式 */
  username?: boolean;
  /** 验证是否为有效的UUID */
  uuid?: boolean;
  /** 验证是否为有效的IPv4地址 */
  ipv4?: boolean;
  /** 验证是否为有效的IPv6地址 */
  ipv6?: boolean;
  /** 验证是否为有效的MAC地址 */
  mac?: boolean;
  /** 验证密码强度 */
  passwordStrength?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  };  
}

/**
 * 分隔字符串的验证配置
 */
export interface DelimitedStringValidationOptions extends StringValidationOptions {
  /** 分隔符 */
  delimiter: string;
  /** 子字符串的最小数量 */
  minCount?: number;
  /** 子字符串的最大数量 */
  maxCount?: number;
  /** 子字符串的验证规则 */
  itemValidation?: StringValidationOptions;
  /** 是否允许空子字符串 */
  allowEmptyItems?: boolean;
  /** 是否去除子字符串两端的空白 */
  trimItems?: boolean;
  /** 去重：是否移除重复的子字符串 */
  deduplicate?: boolean;
  /** 自定义转换函数 */
  transformItems?: (items: string[]) => string[];
}

