import { ExtensionRule, ValidatorFunction } from '../../core';
import { StringRule } from '../core';

export interface StringTrimOptions {
    /**
     * 是否去除首尾空白
     */
    trim?: boolean;

    /**
     * 是否去除中间空白
     */
    trimInner?: boolean;

    /**
     * 是否去除换行符
     */
    trimNewline?: boolean;
}

export interface FormatOptions {
    email?: boolean;
    phone?: boolean;
    username?: boolean;
    uuid?: boolean;
    creditCard?: boolean;
    chineseID?: boolean;
    chinesePostcode?: boolean;
    url?: boolean;
    ipv4?: boolean;
    ipv6?: boolean;
    macAddress?: boolean;
    base64?: boolean;
    hex?: boolean;
    rgb?: boolean;
    rgba?: boolean;
}
export interface StringSplitRule
    extends ExtensionRule, StringTrimOptions, Omit<StringRule, 'type'> {
    type: 'stringSplit';
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
    itemRule?: ExtensionRule | ValidatorFunction;

    /**
     * 是否去除每项的首尾空白
     */
    trim?: boolean;
}

export interface StringAdvanceRule
    extends ExtensionRule, StringTrimOptions, FormatOptions, Omit<StringRule, 'type'> {
    type: 'stringAdvance';
}

export interface PasswordRule extends ExtensionRule, Omit<StringRule, 'type'> {
    type: 'password';
    minLength: 8;
    maxLength: 16;
    uppercase?: boolean;
    lowercase?: boolean;
    number?: boolean;
    specialChar?: boolean;
}

// export interface EmailRule extends StringRule {}
// export interface PhoneRule extends StringRule {}
// export interface UsernameRule extends StringRule {}
// export interface UUIDRule extends StringRule {}
// export interface CreditCardRule extends StringRule {}
// export interface ChineseIDRule extends StringRule {}
// export interface ChinesePostcodeRule extends StringRule {}

// export interface PasswordRule extends StringRule {
//     minLength: 8;
//     maxLength: 16;
//     uppercase?: boolean;
//     lowercase?: boolean;
//     number?: boolean;
//     specialChar?: boolean;
// }

// export interface UrlRule extends StringRule {}
// export interface IPV4Rule extends StringRule {}
// export interface IPV6Rule extends StringRule {}
// export interface MacAddressRule extends StringRule {}

// export interface Base64Rule extends StringRule {}

// export interface HexRule extends StringRule {}
// export interface RGBRule extends StringRule {}
// export interface RGBARule extends StringRule {}

// export type PatternRule =
//     | EmailRule
//     | UrlRule
//     | IPV4Rule
//     | IPV6Rule
//     | MacAddressRule
//     | PhoneRule
//     | UsernameRule
//     | UUIDRule
//     | CreditCardRule
//     | ChineseIDRule
//     | ChinesePostcodeRule
//     | Base64Rule
//     | HexRule
//     | RGBRule
//     | RGBARule;
