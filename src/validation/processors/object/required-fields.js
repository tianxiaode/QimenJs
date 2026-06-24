"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectRequiredFieldsProcessor = void 0;
const errors_1 = require("../../errors");
const ObjectRequiredFieldsProcessor = async (context) => {
    const { value, rule, path } = context;
    const { requiredFields = [], additionalProperties = true } = rule;
    const actualKeys = Object.keys(value);
    // 1. 检查必填项是否缺失
    for (const field of requiredFields) {
        if (!(field in value)) {
            context.errors.push(errors_1.ValidationErrorBuilder.required({
                ...context,
                path: path ? `${path}.${field}` : field,
            }));
        }
    }
    // 2. 检查是否有额外字段（当 additionalProperties 为 false 时）
    if (additionalProperties === false) {
        for (const key of actualKeys) {
            if (!requiredFields.includes(key)) {
                context.errors.push(errors_1.ValidationErrorBuilder.not_allowed(key, requiredFields, {
                    ...context,
                    path: path ? `${path}.${key}` : key,
                }));
            }
        }
    }
};
exports.ObjectRequiredFieldsProcessor = ObjectRequiredFieldsProcessor;
//# sourceMappingURL=required-fields.js.map