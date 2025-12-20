import { HasChildRule, ExtensionRule, ValidatorFunction, HasPropertiesRule } from '../../core';
import { ValidatorBase } from '../../core/ValidatorBase';

export function normalizeChildRule(
    rule: ExtensionRule | HasChildRule | HasPropertiesRule | ValidatorFunction
): ValidatorFunction {
    // 已经是函数，直接返回
    if (typeof rule === 'function') {
        return rule;
    }

    const type = rule.type;

    // 必须是对象并有 type
    if (!rule || typeof rule.type !== 'string') {
        throw new Error(`Child rule must have a type property`);
    }

    // 根据 type 获取对应的 validator
    const validator = ValidatorBase.getValidator(type);
    if (!validator) {
        throw new Error(`Validator for rule type ${rule.type} not found`);
    }

    return (value, rule, context) => {
        return validator(value, rule, context);
    };
}
