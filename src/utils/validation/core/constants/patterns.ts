// 预定义的正则表达式模式
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
export const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
export const IPV6_PATTERN = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
export const MAC_ADDRESS_PATTERN = /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/;
export const PHONE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;
export const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const RGB_COLOR_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
export const RGBA_COLOR_PATTERN = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
export const CREDIT_CARD_PATTERN = /^[\d\s\-]{13,19}$/;
export const CHINESE_ID_PATTERN = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
export const CHINESE_POSTCODE_PATTERN = /^[1-9]\d{5}$/;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

// 密码相关模式
export const UPPERCASE_PATTERN = /[A-Z]/;
export const LOWERCASE_PATTERN = /[a-z]/;
export const DIGIT_PATTERN = /\d/;
export const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
