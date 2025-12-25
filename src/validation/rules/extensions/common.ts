import { CompareRuleOptions, ContainsRuleOptions } from '../common';

/**
 * 比较操作符规则选项接口
 * 继承 CompareRuleOptions 接口，但排除了 operator 属性
 * 用于定义不包含操作符的比较规则选项
 */
export interface CompareOperatorRuleOptions extends Omit<CompareRuleOptions, 'operator'> {}

/**
 * 包含扩展规则选项接口
 * 扩展 ContainsRuleOptions 接口，添加了最小和最大包含数量的选项
 * 用于定义包含验证规则的扩展选项
 */
export interface ContainsExtensionRuleOptions extends ContainsRuleOptions {
    /**
     * 最小包含数量
     * 指定验证内容中至少要包含的项目数量
     */
    minContains?: number;
    
    /**
     * 最大包含数量
     * 指定验证内容中最多可包含的项目数量
     */
    maxContains?: number;
}