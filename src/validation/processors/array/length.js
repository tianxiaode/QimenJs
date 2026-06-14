"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayLengthProcessor = void 0;
const errors_1 = require("../../errors");
const ArrayLengthProcessor = async (context) => {
    const { value, rule } = context;
    //不要做任何防御，要相信上一处理器
    const length = value.length;
    // 检查最小长度
    if (rule.minLength !== undefined && length < rule.minLength) {
        context.errors.push(errors_1.ValidationErrorBuilder.too_small(rule.minLength, value, false, context));
        if (!rule.allErrors)
            return;
    }
    // 检查最大长度
    if (rule.maxLength !== undefined && length > rule.maxLength) {
        context.errors.push(errors_1.ValidationErrorBuilder.too_large(rule.maxLength, value, false, context));
        if (!rule.allErrors)
            return;
    }
    // 检查精确长度
    if (rule.length !== undefined && length !== rule.length) {
        context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, context));
    }
};
exports.ArrayLengthProcessor = ArrayLengthProcessor;
//# sourceMappingURL=length.js.map