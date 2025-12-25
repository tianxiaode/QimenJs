import { ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { ObjectRuleOptions } from '../../../rules';

import { checkObjectType } from './type';
import { createCoreValidator, preprocessRequiredRule } from '../factory';
import { checkPresence } from '../../common';
import { checkRequiredFields } from './required-fields';
import { validateProperties } from './properties';
import { validateAdditionalProperties } from './additional-properties';

/**
 * 检查对象验证规则是否需要值存在
 * 当规则中包含必需字段、属性或额外属性约束时，值必须存在
 * 
 * @param rule 对象验证规则
 * @returns 如果规则需要值存在则返回 true，否则返回 false
 */
const requiresObjectValuesCheck = (rule: ObjectRuleOptions): boolean => {
    return (
        rule.requiredFields !== undefined ||
        rule.properties !== undefined ||
        rule.additionalProperties !== undefined
    );
};

/**
 * 对象验证器
 *
 * 组合基础验证函数和自定义验证逻辑，形成完整的对象验证流程。
 * 验证按照以下顺序执行：
 * 1. Gates检查 - 验证值的存在性规则和类型（如果任一检查失败，则后续验证不执行）
 * 2. 必需字段检查 - 验证对象是否包含所有必需字段
 * 3. 对象属性检查 - 验证对象的属性是否符合规则要求
 *
 * Gates验证包括：
 * - 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * - 类型检查 - 验证值是否为对象类型
 * 
 * 如果任一gates验证失败，后续验证将不会执行。
 */
export const validateObject = createCoreValidator(
    (rule: ObjectRuleOptions): ObjectRuleOptions => {
        // 使用通用的预处理函数，传入特定于对象的检查函数
        return preprocessRequiredRule(rule, requiresObjectValuesCheck);
    },
    // Gates验证函数数组
    [checkPresence, checkObjectType],
    // 业务验证函数数组 - 必需字段检查现在是业务验证，不是gates
    [checkRequiredFields],

    // 自定义对象验证逻辑
    (
        value: any,
        rule: ObjectRuleOptions,
        context: ValidationErrorContext = {}
    ): ValidationResult => {
        // 如果值不是对象或为 null，跳过对象属性验证
        if (typeof value !== 'object' || value === null) return null;

        // 获取对象属性规则配置
        const properties = rule.properties;

        if (properties) {
            // 验证已定义的属性是否符合规则
            const propertiesResult = validateProperties(
                value,
                properties,
                rule.allPropertiesError,
                context
            );
            if (propertiesResult) {
                return propertiesResult;
            }

            // 验证是否包含未定义的额外属性
            return validateAdditionalProperties(value, properties, context);
        }

        return null;
    }
);

// 注册对象验证器
Validator.registerValidator('object', validateObject);