import { ValidationRuleBase } from './types';

/**
 * 字符串验证规则接口
 * 定义了用于字符串类型数据验证的各种规则选项
 */
export interface StringRule extends ValidationRuleBase {
    /**
     * 规则类型标识，固定为'string'，表明这是字符串验证规则
     */
    type: 'string';

    /**
     * 最小长度限制
     * 字符串长度不能少于指定数值
     */
    minLength?: number;

    /**
     * 最大长度限制
     * 字符串长度不能超过指定数值
     */
    maxLength?: number;

    /**
     * 精确长度限制
     * 字符串长度必须等于指定数值
     * 如果设置了此属性，minLength和maxLength将被忽略
     */
    exactLength?: number;

    /**
     * 正则表达式模式匹配
     * 字符串必须匹配指定的正则表达式模式
     */
    pattern?: RegExp;

    /**
     * 枚举值验证
     * 字符串必须是枚举数组中的某一个值
     */
    enum?: readonly string[];
}

export interface EmailRule extends StringRule {}
export interface PhoneRule extends StringRule {}
export interface UsernameRule extends StringRule {}
export interface UUIDRule extends StringRule {}
export interface CreditCardRule extends StringRule {}
export interface ChineseIDRule extends StringRule {}
export interface ChinesePostcodeRule extends StringRule {}

export interface PasswordRule extends StringRule {
    minLength: 8;
    maxLength: 16;
    uppercase?: boolean;
    lowercase?: boolean;
    number?: boolean;
    specialChar?: boolean;
}

export interface UrlRule extends StringRule {}
export interface IPV4Rule extends StringRule {}
export interface IPV6Rule extends StringRule {}
export interface MacAddressRule extends StringRule {}

export interface Base64Rule extends StringRule {}

export interface HexRule extends StringRule {}
export interface RGBRule extends StringRule {}
export interface RGBARule extends StringRule {}

export type PatternRule =
    | EmailRule
    | UrlRule
    | IPV4Rule
    | IPV6Rule
    | MacAddressRule
    | PhoneRule
    | UsernameRule
    | UUIDRule
    | CreditCardRule
    | ChineseIDRule
    | ChinesePostcodeRule
    | Base64Rule
    | HexRule
    | RGBRule
    | RGBARule;



export interface StringSplitRule extends StringRule {
  separator: string | RegExp;

  /**
   * 拆分后的最小项数
   */
  minItems?: number;

  /**
   * 拆分后的最大项数
   */
  maxItems?: number;

  /**
   * 每一项是否允许为空字符串
   */
  allowEmptyItem?: boolean;

  /**
   * 每一项的验证规则（关键）
   */
  itemRule?: StringRule;

  /**
   * 是否去除每项的首尾空白
   */
  trim?: boolean;
}

