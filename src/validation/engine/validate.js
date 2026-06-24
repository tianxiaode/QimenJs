"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = exports.assert = exports.validate = void 0;
const core_1 = require("../core");
const errors_1 = require("../errors");
const types_1 = require("../types");
const doValidateWithThrow = async (value, rule, thorwError = false) => {
    const result = await (0, core_1.doValidate)(value, rule);
    if (thorwError && !result.isValid) {
        errors_1.ValidationErrorBuilder.throwIfAny(value, rule, result.errors, { ...result.context });
    }
    return result.isValid ? null : result.errors;
};
/**
 * 解析值：处理默认值并返回最终结果
 */
const normalizeValue = async (value, defaultValue, rule) => {
    const result = await (0, core_1.doValidate)(value, rule);
    // 逻辑：只有当“确实有错”且“业务要求必填”时，才动用那个保底的 defaultValue
    if (result.errors && rule.required) {
        // 如果此时 defaultValue 也是 undefined，那说明调用者配置失误
        // 我们可以返回一个 null 或者原值，但逻辑上这里必须有一个确定的值
        return defaultValue;
    }
    return value;
};
const specialTypes = {
    split: (r) => ({ separator: ',', ...r, type: 'split' }),
};
const SCHEMA_MAP = { ...specialTypes };
types_1.allValidateTypes.forEach(tag => {
    SCHEMA_MAP[tag] = (r) => ({ ...r, type: tag });
});
types_1.formatTypes.forEach(type => {
    SCHEMA_MAP[type] = (r) => ({ ...r, type: 'format', format: type });
});
const validateRaw = {
    validate: (value, rule) => doValidateWithThrow(value, rule),
};
const normalizeRaw = {};
const assertRaw = {};
Object.keys(SCHEMA_MAP).forEach(tag => {
    const factory = SCHEMA_MAP[tag];
    validateRaw[tag] = async (v, r = {}) => await doValidateWithThrow(v, factory(r));
    normalizeRaw[tag] = async (v, defaultValue, r = {}) => await normalizeValue(v, defaultValue, factory(r));
    assertRaw[tag] = async (v, r = {}) => await doValidateWithThrow(v, factory(r), true);
});
exports.validate = validateRaw;
exports.assert = assertRaw;
exports.normalize = normalizeRaw;
//# sourceMappingURL=validate.js.map