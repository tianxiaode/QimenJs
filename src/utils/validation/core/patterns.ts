// 预定义的正则表达式模式
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
export const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
export const IPV6_PATTERN = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
export const MAC_ADDRESS_PATTERN = /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/;
export const PHONE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;
export const UUID_PATTERN =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const RGB_COLOR_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
export const RGBA_COLOR_PATTERN =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
export const CREDIT_CARD_PATTERN = /^[\d\s\-]{13,19}$/;
export const CHINESE_ID_PATTERN = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
export const CHINESE_POSTCODE_PATTERN = /^[1-9]\d{5}$/;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

// 密码相关模式 - 用于密码强度验证
export const UPPERCASE_PATTERN = /[A-Z]/;        // 大写字母匹配模式
export const LOWERCASE_PATTERN = /[a-z]/;        // 小写字母匹配模式
export const DIGIT_PATTERN = /\d/;               // 数字匹配模式
export const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // 特殊字符匹配模式

/**
 * 验证模式类型枚举
 * 定义了所有可用的验证模式类型常量
 */
export enum ValidationPatternType {
    EMAIL = 'EMAIL',                    // 电子邮件验证
    URL = 'URL',                        // URL链接验证
    IPV4 = 'IPV4',                      // IPv4地址验证
    IPV6 = 'IPV6',                      // IPv6地址验证
    MAC_ADDRESS = 'MAC_ADDRESS',        // MAC地址验证
    PHONE = 'PHONE',                    // 电话号码验证
    UUID = 'UUID',                      // UUID格式验证
    BASE64 = 'BASE64',                  // Base64编码验证
    HEX_COLOR = 'HEX_COLOR',            // 十六进制颜色值验证
    RGB_COLOR = 'RGB_COLOR',            // RGB颜色值验证
    RGBA_COLOR = 'RGBA_COLOR',          // RGBA颜色值验证
    CREDIT_CARD = 'CREDIT_CARD',        // 信用卡号验证
    CHINESE_ID = 'CHINESE_ID',          // 中国身份证号验证
    CHINESE_POSTCODE = 'CHINESE_POSTCODE', // 中国邮政编码验证
    USERNAME = 'USERNAME',              // 用户名格式验证
    UPPERCASE = 'UPPERCASE',            // 大写字母验证
    LOWERCASE = 'LOWERCASE',            // 小写字母验证
    DIGIT = 'DIGIT',                    // 数字验证
    SPECIAL_CHAR = 'SPECIAL_CHAR',      // 特殊字符验证
}

/**
 * 验证模式映射表
 * 将验证类型与对应的正则表达式进行映射
 */
const ValidationPatternMap: Record<ValidationPatternType, RegExp> = {
    [ValidationPatternType.EMAIL]: EMAIL_PATTERN,
    [ValidationPatternType.URL]: URL_PATTERN,
    [ValidationPatternType.IPV4]: IPV4_PATTERN,
    [ValidationPatternType.IPV6]: IPV6_PATTERN,
    [ValidationPatternType.MAC_ADDRESS]: MAC_ADDRESS_PATTERN,
    [ValidationPatternType.PHONE]: PHONE_PATTERN,
    [ValidationPatternType.UUID]: UUID_PATTERN,
    [ValidationPatternType.BASE64]: BASE64_PATTERN,
    [ValidationPatternType.HEX_COLOR]: HEX_COLOR_PATTERN,
    [ValidationPatternType.RGB_COLOR]: RGB_COLOR_PATTERN,
    [ValidationPatternType.RGBA_COLOR]: RGBA_COLOR_PATTERN,
    [ValidationPatternType.CREDIT_CARD]: CREDIT_CARD_PATTERN,
    [ValidationPatternType.CHINESE_ID]: CHINESE_ID_PATTERN,
    [ValidationPatternType.CHINESE_POSTCODE]: CHINESE_POSTCODE_PATTERN,
    [ValidationPatternType.USERNAME]: USERNAME_PATTERN,
    [ValidationPatternType.UPPERCASE]: UPPERCASE_PATTERN,
    [ValidationPatternType.LOWERCASE]: LOWERCASE_PATTERN,
    [ValidationPatternType.DIGIT]: DIGIT_PATTERN,
    [ValidationPatternType.SPECIAL_CHAR]: SPECIAL_CHAR_PATTERN,
};

/**
 * 获取指定类型的验证正则表达式
 * @param type 验证模式类型
 * @returns 对应的正则表达式
 */
export function getValidationPattern(type: ValidationPatternType): RegExp {
    return ValidationPatternMap[type];
}

/**
 * 设置或更新指定类型的验证正则表达式
 * @param type 验证模式类型
 * @param pattern 新的正则表达式
 */
export function setValidationPattern(type: ValidationPatternType, pattern: RegExp): void {
    ValidationPatternMap[type] = pattern;
}