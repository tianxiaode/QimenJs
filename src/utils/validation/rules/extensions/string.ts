import { RuleArrayItemsOptions, RuleBaseOptions, ValidatorFunction } from '../../core';
import { StringRuleOptions } from '../core';

export interface StringTrimRuleOptions {
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


export interface StringExtensionRuleOptions extends StringRuleOptions, StringTrimRuleOptions {
}

export interface StringSplitRuleOptions extends StringExtensionRuleOptions, RuleArrayItemsOptions {
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
     * 是否去除每项的首尾空白
     */
    trim?: boolean;
}


export interface StringRequiredRuleOptions extends Omit<
    StringExtensionRuleOptions,
    'required' | 'nullable' | 'empty'
> {}

export interface PasswordRuleOptions extends StringRequiredRuleOptions {
    minLength: number;
    maxLength: number;
    uppercase?: boolean;
    lowercase?: boolean;
    number?: boolean;
    specialChar?: boolean;
}