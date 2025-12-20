import {
    ValidationRuleError,
    ValidationErrorContext,
    ValidationResult,
    normalizeValidationResult,
    HasPropertiesRule,
    ValidatorFunction,
    ValidationErrorBuilder,
} from '../../../core';
import { ObjectRule } from '../../../rules';

import { checkObjectType } from './type';
import { createCoreValidator } from '../factory';
import { checkPresence } from '../presence';
import { normalizeChildRule } from '../convert';

export const validateObject = createCoreValidator<ObjectRule>(
    [checkPresence, checkObjectType],
    (value: any, rule: ObjectRule, context: ValidationErrorContext = {}): ValidationResult => {
        if (typeof value !== 'object' || value === null) return null;

        // 验证要求字段是否存在
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

        const properties = rule.properties;

        if (properties) {
            const allPropertiesError = rule.allPropertiesError ?? false;
            const propertiesResult = validateProperties(
                value,
                properties,
                rule.allPropertiesError,
                context
            );
            if (propertiesResult) {
                return propertiesResult;
            }

            return validateAdditionalProperties(value, properties, context);
        }

        return null;
    }
);

function validateRequiredFields(
    value: any,
    requiredFields: readonly string[],
    context: ValidationErrorContext
) {
    for (const key of requiredFields) {
        if (!(key in value)) {
            const fieldPath = context && context.path ? `${context.path}.${key}` : key;
            return ValidationErrorBuilder.missing_field(key, { ...context, field: fieldPath });
        }
    }
}

function validateProperties(
    value: any,
    properties: Record<string, ValidatorFunction | HasPropertiesRule>,
    allPropertiesError: boolean = false,
    context: ValidationErrorContext = {}
): ValidationResult {
    let errors: ValidationRuleError[] = [];
    for (const key of Object.keys(properties)) {
        const fieldRule: ValidatorFunction | HasPropertiesRule = properties[key];
        const fieldValue = value[key];
        const fieldPath = context && context.path ? `${context.path}.${key}` : key;
        const validate = normalizeChildRule(fieldRule);
        const result = validate(fieldValue, {} as any, { ...context, path: fieldPath });

        if (result && allPropertiesError) {
            errors = errors.concat(result);
        } else {
            return result;
        }
    }

    return normalizeValidationResult(errors);
}

function validateAdditionalProperties(
    value: any,
    properties: Record<string, ValidatorFunction | HasPropertiesRule>,
    context: ValidationErrorContext = {}
): ValidationResult {
    const allowedKeys = new Set(Object.keys(properties));

    for (const key of Object.keys(value)) {
        if (!allowedKeys.has(key)) {
            const fieldPath = context && context.path ? `${context.path}.${key}` : key;
            return [ValidationErrorBuilder.not_allowed(key, Array.from(allowedKeys), {
                ...context,
                field: fieldPath,
            })];
        }
    }

    return null;
}
