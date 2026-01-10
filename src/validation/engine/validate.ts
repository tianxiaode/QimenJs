import { doValidate } from '../core';
import { ValidationErrorBuilder } from '../errors';
import { ValidationRule, ValidateResult, ALL_TAGS, formatTypes } from '../types';

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

const specialTypes = {
    split: (r: any) => ({ separator: ',', ...r, type: 'split' }),
};

const SCHEMA_MAP: any = { ...specialTypes };

ALL_TAGS.forEach(tag => {
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

Object.keys(SCHEMA_MAP).forEach(tag => {
    const factory = SCHEMA_MAP[tag];
    validateRaw[tag] = async (v: any, r: any = {}) => await doValidateWithThrow(v, factory(r));
    normalizeRaw[tag] = async (v: any, defaultValue: any, r: any = {}) =>
        await normalizeValue(v, defaultValue, factory(r));
    assertRaw[tag] = async (v: any, r: any = {}) => await doValidateWithThrow(v, factory(r), true);
});

type GetRule<T> = T extends (r: any) => infer R ? R : never;

// 2. 自动推导 validate/assert 的函数组类型
type ValidatorGroup<M> = {
    [K in keyof M]: (value: any, rule?: Omit<GetRule<M[K]>, 'type'>) => Promise<ValidateResult>;
};

// 3. 自动推导 normalize 的函数组类型
type NormalizerGroup<M> = {
    [K in keyof M]: (value: any, fallback: any, rule?: Omit<GetRule<M[K]>, 'type'>) => Promise<any>;
};

export const validate = validateRaw as ValidatorGroup<typeof SCHEMA_MAP>;
export const assert = assertRaw as ValidatorGroup<typeof SCHEMA_MAP>;
export const normalize = normalizeRaw as NormalizerGroup<typeof SCHEMA_MAP>;
