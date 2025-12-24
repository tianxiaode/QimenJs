import { RuleArrayItemsOptions, RuleBaseOptions, ValidatorFunction } from '../../core';
import { StringRuleOptions } from '../core';

/**
 * 字符串修剪规则选项接口
 * 定义字符串修剪相关的选项
 */
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

/**
 * 字符串扩展规则选项接口
 * 继承 StringRuleOptions 和 StringTrimRuleOptions，提供字符串验证的完整选项
 */
export interface StringExtensionRuleOptions extends StringRuleOptions, StringTrimRuleOptions {
}

/**
 * 字符串拆分规则选项接口
 * 继承 StringExtensionRuleOptions 和 RuleArrayItemsOptions，提供字符串拆分验证的选项
 */
export interface StringSplitRuleOptions extends StringExtensionRuleOptions, RuleArrayItemsOptions {
    /**
     * 拆分分隔符，可以是字符串或正则表达式
     */
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

/**
 * 字符串必需规则选项接口
 * 继承 StringExtensionRuleOptions，排除了 required、nullable 和 empty 选项
 * 用于定义不包含基础验证选项的字符串规则
 */
export interface StringRequiredRuleOptions extends Omit<
    StringExtensionRuleOptions,
    'required' | 'nullable' | 'empty'
> {}

/**
 * 密码规则选项接口
 * 继承 StringRequiredRuleOptions，提供密码验证的特定选项
 */
export interface PasswordRuleOptions extends StringRequiredRuleOptions {
    /**
     * 密码最小长度要求
     */
    minLength: number;
    
    /**
     * 密码最大长度要求
     */
    maxLength: number;
    
    /**
     * 是否需要包含大写字母
     */
    uppercase?: boolean;
    
    /**
     * 是否需要包含小写字母
     */
    lowercase?: boolean;
    
    /**
     * 是否需要包含数字
     */
    number?: boolean;
    
    /**
     * 是否需要包含特殊字符
     */
    specialChar?: boolean;
}