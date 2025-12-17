import { ValidationResult } from '../../core';
import { RULE_MAP, RULE_ALIASES, NON_RULE_KEYS } from './rule-map';

/**
 * 根据关键词和值获取验证规则函数
 * @param keyword 验证关键词
 * @param value 规则参数值
 * @returns 验证函数或null
 */
export function getRuleFunction(
    keyword: string, 
    value?: any
): ((val: any) => ValidationResult) | null {
    // 处理别名
    const actualKeyword = (RULE_ALIASES as Record<string, string>)[keyword] || keyword;
    
    // 查找规则
    const ruleCreator = (RULE_MAP as Record<string, Function>)[actualKeyword];
    
    if (!ruleCreator) {
        return null;
    }
    
    try {
        // 执行规则创建器
        const ruleFunction = value !== undefined ? ruleCreator(value) : ruleCreator();
        return typeof ruleFunction === 'function' ? ruleFunction : null;
    } catch (error) {
        console.warn(`Failed to create rule for keyword "${keyword}":`, error);
        return null;
    }
}

/**
 * 智能批量获取验证规则函数
 * @param options 验证选项对象
 * @returns 验证规则函数数组
 */
export function getRuleFunctions(
    options: Record<string, any>
): Array<(val: any) => ValidationResult> {
    const rules: Array<(val: any) => ValidationResult> = [];
    
    Object.entries(options).forEach(([keyword, value]) => {
        // 智能排除：如果键在 NON_RULE_KEYS 中，或者在 RULE_MAP 中不存在
        if (NON_RULE_KEYS.includes(keyword as any) || 
            !(keyword in RULE_MAP) && !(keyword in RULE_ALIASES)) {
            return;
        }
        
        const ruleFunction = getRuleFunction(keyword, value);
        if (ruleFunction) {
            rules.push(ruleFunction);
        }
    });
    
    return rules;
}