import { doValidate } from '../core';
import { ValidationErrorBuilder } from '../errors';
import {
    ValidationRule,
    ValidateResult,
    allValidateTypes,
    formatTypes,
    StringRule,
    NumberRule,
    BooleanRule,
    FileRule,
    DateRule,
    ArrayRule,
    ObjectRule,
    CompareRule,
    SplitRule,
    FormatRule,
    PasswordRule,
} from '../types';

const doValidateWithThrow = async (
    value: any,
    rule: ValidationRule,
    thorwError = false
): Promise<ValidateResult> => {
    const result = await doValidate(value, rule);
    if (thorwError && !result.isValid) {
        ValidationErrorBuilder.throwIfAny(value, rule, result.errors, { ...result.context });
    }
    return result.isValid ? null : result.errors;
};

/**
 * 解析值：处理默认值并返回最终结果
 */
const normalizeValue = async (
    value: any,
    defaultValue: any,
    rule: ValidationRule
): Promise<any> => {
    const result = await doValidate(value, rule);

    // 逻辑：只有当“确实有错”且“业务要求必填”时，才动用那个保底的 defaultValue
    if (result.errors && rule.required) {
        // 如果此时 defaultValue 也是 undefined，那说明调用者配置失误
        // 我们可以返回一个 null 或者原值，但逻辑上这里必须有一个确定的值
        return defaultValue;
    }

    return value;
};

interface RuleRegistry {
    string: Omit<StringRule, 'type'>;
    number: Omit<NumberRule, 'type'>;
    boolean: Omit<BooleanRule, 'type'>;
    date: Omit<DateRule, 'type'>;
    array: Omit<ArrayRule, 'type'>;
    object: Omit<ObjectRule, 'type'>;
    password: Omit<PasswordRule, 'type'>;
    compare: Omit<CompareRule, 'type'>;
    file: Omit<FileRule, 'type'>;
    split: Omit<SplitRule, 'type'>;
    format: Omit<FormatRule, 'type'>;
    email: Omit<FormatRule, 'type' | 'format'>;
    url: Omit<FormatRule, 'type' | 'format'>;
    phone: Omit<FormatRule, 'type' | 'format'>;
    uuid: Omit<FormatRule, 'type' | 'format'>;
    ipv4: Omit<FormatRule, 'type' | 'format'>;
    ipv6: Omit<FormatRule, 'type' | 'format'>;
    macAddress: Omit<FormatRule, 'type' | 'format'>;
    hexColor: Omit<FormatRule, 'type' | 'format'>;
    rgbColor: Omit<FormatRule, 'type' | 'format'>;
    rgbaColor: Omit<FormatRule, 'type' | 'format'>;
}

const specialTypes = {
    split: (r: RuleRegistry['split']) => ({ separator: ',', ...r, type: 'split' }),
};

const SCHEMA_MAP: any = { ...specialTypes };

allValidateTypes.forEach(tag => {
    SCHEMA_MAP[tag] = (r: any) => ({ ...r, type: tag });
});

formatTypes.forEach(type => {
    SCHEMA_MAP[type] = (r: any) => ({ ...r, type: 'format', format: type });
});

const validateRaw: any = {
    validate: (value: any, rule: ValidationRule) => doValidateWithThrow(value, rule),
};

const normalizeRaw: any = {};

const assertRaw: any = {};

type ValidatorSugar<T> = (value: any, rule: T) => Promise<ValidateResult>;
type NormalizerSugar<T> = (value: any, fallbackValue: any, rule: T) => Promise<any>;

Object.keys(SCHEMA_MAP).forEach(tag => {
    const factory = SCHEMA_MAP[tag];
    validateRaw[tag] = async (v: any, r: any = {}) => await doValidateWithThrow(v, factory(r));
    normalizeRaw[tag] = async (v: any, defaultValue: any, r: any = {}) =>
        await normalizeValue(v, defaultValue, factory(r));
    assertRaw[tag] = async (v: any, r: any = {}) => await doValidateWithThrow(v, factory(r), true);
});

export const validate = validateRaw as {
    readonly [K in keyof RuleRegistry]: ValidatorSugar<RuleRegistry[K]>;
} & { 
    // 补上那个通用的 validate 方法
    validate: (value: any, rule: ValidationRule) => Promise<ValidateResult> 
};

export const assert = assertRaw as {
    readonly [K in keyof RuleRegistry]: ValidatorSugar<RuleRegistry[K]>;
} & { 
    validate: (value: any, rule: ValidationRule) => Promise<void> 
};

export const normalize = normalizeRaw as {
    readonly [K in keyof RuleRegistry]: NormalizerSugar<RuleRegistry[K]>;
};
