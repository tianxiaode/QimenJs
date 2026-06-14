"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberRangeProcessor = void 0;
const errors_1 = require("../../errors");
const NumberRangeProcessor = async (context) => {
    const { value, rule } = context;
    //不需要做任何防御，相信上一处理器
    if (rule.min !== undefined && value < rule.min) {
        context.errors.push(errors_1.ValidationErrorBuilder.too_small(rule.min, value, false, context));
        if (!rule.allErrors)
            return;
    }
    if (rule.max !== undefined && value > rule.max) {
        context.errors.push(errors_1.ValidationErrorBuilder.too_large(rule.max, value, false, context));
    }
};
exports.NumberRangeProcessor = NumberRangeProcessor;
//# sourceMappingURL=range.js.map