"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTypeProcessor = void 0;
const errors_1 = require("../../errors");
const DateTypeProcessor = async (context) => {
    const { value } = context;
    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误
    // 检查值是否为 Date 实例并且是有效日期
    // 1. value instanceof Date - 确保是 Date 对象实例
    // 2. isNaN(value.getTime()) - 检查日期是否有效，Invalid Date 的 getTime() 返回 NaN
    if (!(value instanceof Date) || isNaN(value.getTime())) {
        // 值不是有效的 Date 对象，返回类型不匹配错误
        context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('Date', typeof value, context));
        context.terminate = true;
    }
};
exports.DateTypeProcessor = DateTypeProcessor;
//# sourceMappingURL=type.js.map