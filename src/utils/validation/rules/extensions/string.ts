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
    type: 'split';
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
    type: 'stringEx';
}

export interface PasswordRule extends ExtensionRule, Omit<StringRule, 'type'> {
    type: 'password';
    minLength: 8;
    maxLength: 16;
    uppercase?: false;
    lowercase?: true;
    number?: true;
    specialChar?:true;
}

