import {
    Validator,
    ValidatorFunction,
    ValidationTypeNotDefinedError,
    ValidatorNotFoundError,
} from '../../core';

/**
 * 规范化子规则配置
 *
 * 此函数负责将不同形式的验证规则配置转换为统一的验证函数。
 * 支持两种形式的输入：
 * 1. 直接传入验证函数
 * 2. 传入带有 type 属性的对象配置
 *
 * @param rule - 需要规范化的验证规则，可以是函数或对象
 * @returns 标准化的验证函数
 * @throws {ValidationTypeNotDefinedError} 当规则配置无效时抛出
 * @throws {ValidatorNotFoundError} 当找不到对应类型的验证器时抛出
 */
export function normalizeChildRule(rule: any): ValidatorFunction {
    // 如果传入的已经是函数，直接返回，无需转换
    if (typeof rule === 'function') {
        return rule;
    }

    // 验证规则必须是对象且包含 type 属性
    // 1. !rule: 检查 rule 是否为空值（null、undefined 等）
    // 2. typeof rule !== 'object': 确保 rule 是对象类型
    // 3. typeof rule.type !== 'string': 确保 type 属性存在且为字符串
    if (!rule || typeof rule !== 'object' || typeof rule.type !== 'string') {
        throw new ValidationTypeNotDefinedError('Child rule must have a type property', {
            rule,
        });
    }

    // 提取规则类型
    const type = rule.type;

    // 根据类型获取对应的验证器函数
    const validator = Validator.getValidator(type);

    // 如果找不到对应类型的验证器，抛出错误
    if (!validator) {
        throw new ValidatorNotFoundError(type, {
            availableValidators: Array.from(Validator.getRegisteredTypes()),
        });
    }

    // 返回包装后的验证函数，保持接口一致性
    return (value, rule, context) => {
        return validator(value, rule, context);
    };
}
