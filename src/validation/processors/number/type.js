"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberTypeProcessor = void 0;
const errors_1 = require("../../errors");
const NumberTypeProcessor = async (context) => {
    const { value, rule } = context;
    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误
    // 检查值是否为 number 类型
    if (typeof value !== 'number') {
        // 值不是 number 类型，返回类型不匹配错误
        context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('number', typeof value, context));
        context.terminate = true;
        return;
    }
    // 检查数字是否为有限值，排除 NaN 和 Infinity/-Infinity
    if (!Number.isFinite(value)) {
        if (!rule.infinite) {
            // 值不是有限数字，返回无效值错误
            context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, context));
        }
        context.terminate = true;
    }
};
exports.NumberTypeProcessor = NumberTypeProcessor;
//# sourceMappingURL=type.js.map