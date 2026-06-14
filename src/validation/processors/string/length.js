"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringLengthProcessor = void 0;
const errors_1 = require("../../errors");
const StringLengthProcessor = async (context) => {
    const { value, rule } = context;
    //不要做任何防御，要相信上一处理器
    let len = value.length;
    if (rule.min !== undefined && len < rule.min) {
        context.errors.push(errors_1.ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors)
            return;
    }
    if (rule.max !== undefined && len > rule.max) {
        context.errors.push(errors_1.ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }
    if (rule.length !== undefined && len !== rule.length) {
        context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, context));
    }
};
exports.StringLengthProcessor = StringLengthProcessor;
//# sourceMappingURL=length.js.map