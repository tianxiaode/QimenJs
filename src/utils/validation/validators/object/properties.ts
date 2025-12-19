import {
    ValidationErrorBuilder,
    InternalValidate,
    ValidationErrorContext,
    ValidatorResult,
} from '../../core';
import { ObjectRule } from '../../rules';

export function validateObjectProperties(
    value: any,
    rule: ObjectRule,
    validate: InternalValidate,
    context?: ValidationErrorContext
): ValidatorResult {
    if (typeof value !== 'object' || value === null) return null;
    if (!rule.properties) return null;

    const props = rule.properties;

    // 1️⃣ 必填字段检查
    if (rule.requiredFields) {
        for (const key of rule.requiredFields) {
            if (!(key in value)) {
                const fieldPath = context && context.path ? `${context.path}.${key}` : key;
                return ValidationErrorBuilder.missing_field(key, { ...context, field: fieldPath });
            }
        }
    }

    // 2️⃣ 已定义字段递归校验
    for (const key of Object.keys(props)) {
        const fieldRule = props[key];
        const fieldValue = value[key];
        const fieldPath = context && context.path ? `${context.path}.${key}` : key;

        const result = validate(fieldValue, fieldRule, { ...context, path: fieldPath });

        if (!result.valid && result.errors?.length) {
            return result.errors[0]; // short-circuit
        }
    }

    return null;
}
