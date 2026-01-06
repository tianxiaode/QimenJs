import { ValidationPatternType } from "../types";
import { ValidationRegistry } from "./ValidationRegistry";

// 预定义的正则表达式模式
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

// 修复后的IPV4_PATTERN（已更新）
export const IPV4_PATTERN =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// 更复杂的IPv6正则表达式，支持压缩格式
export const IPV6_PATTERN =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

export const MAC_ADDRESS_PATTERN = /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/;
export const PHONE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;

// UUID_PATTERN - 保持不变，因为测试用例可能有误
export const UUID_PATTERN =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// 修复后的RGB_COLOR_PATTERN - 验证数值范围
export const RGB_COLOR_PATTERN =
    /^rgb\(\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*\)$/;

// 修复后的RGBA_COLOR_PATTERN - 验证数值范围
export const RGBA_COLOR_PATTERN =
    /^rgba\(\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(0|1|0?\.[0-9]+)\s*\)$/;

export const CREDIT_CARD_PATTERN = /^(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,4}|\d{13,16}|\d{18})$/;
export const CHINESE_ID_PATTERN = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
export const CHINESE_POSTCODE_PATTERN = /^[1-9]\d{5}$/;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

// 密码相关模式 - 用于密码强度验证
export const UPPERCASE_PATTERN = /[A-Z]/; // 大写字母匹配模式
export const LOWERCASE_PATTERN = /[a-z]/; // 小写字母匹配模式
export const DIGIT_PATTERN = /\d/; // 数字匹配模式
export const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // 特殊字符匹配模式


ValidationRegistry.registerPattern(ValidationPatternType.EMAIL, EMAIL_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.URL, URL_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.IPV4, IPV4_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.IPV6, IPV6_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.MAC_ADDRESS, MAC_ADDRESS_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.PHONE, PHONE_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.UUID, UUID_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.BASE64, BASE64_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.HEX_COLOR, HEX_COLOR_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.RGB_COLOR, RGB_COLOR_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.RGBA_COLOR, RGBA_COLOR_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.CREDIT_CARD, CREDIT_CARD_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.CHINESE_ID, CHINESE_ID_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.CHINESE_POSTCODE, CHINESE_POSTCODE_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.USERNAME, USERNAME_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.UPPERCASE, UPPERCASE_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.LOWERCASE, LOWERCASE_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.DIGIT, DIGIT_PATTERN);
ValidationRegistry.registerPattern(ValidationPatternType.SPECIAL_CHAR, SPECIAL_CHAR_PATTERN);
