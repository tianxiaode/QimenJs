import {
    ValidationErrorContext,
    ValidationResult,
    Validator,
} from '../../../core';
import { ObjectRuleOptions } from '../../../rules';

import { checkObjectType } from './type';
import { createCoreValidator } from '../factory';
import { checkPresence } from '../presence';
import { validateRequiredFields } from './required-fields';
import { validateProperties } from './properties';
import { validateAdditionalProperties } from './additional-properties';

/**
 * 对象验证器
 * 
 * 组合基础验证函数和自定义验证逻辑，形成完整的对象验证流程。
 * 验证按照以下顺序执行：
 * 1. 存在性检查 - 验证值是否符合 required/nullable/empty 规则
 * 2. 类型检查 - 验证值是否为对象类型
 * 3. 对象属性检查 - 验证对象的属性是否符合规则要求
 * 
 * 对象属性检查包括：
 * - 必需字段验证
 * - 属性规则验证
 * - 额外属性验证
 */
export const validateObject = createCoreValidator(
    // 基础验证函数数组
    [checkPresence, checkObjectType],
    
    // 自定义对象验证逻辑
    (
        value: any,
        rule: ObjectRuleOptions,
        context: ValidationErrorContext = {}
    ): ValidationResult => {
        // 如果值不是对象或为 null，跳过对象属性验证
        if (typeof value !== 'object' || value === null) return null;

        // 验证必需字段是否存在
        if (rule.requiredFields) {
            const requiredFieldsResult = validateRequiredFields(
                value,
                rule.requiredFields,
                context
            );
            if (requiredFieldsResult) {
                return [requiredFieldsResult];
            }
        }

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