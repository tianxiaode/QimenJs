"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanypeProcessor = void 0;
const errors_1 = require("../../errors");
const BooleanypeProcessor = async (context) => {
    const { value, rule } = context;
    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误
    // 检查值是否为布尔类型
    if (typeof value !== 'boolean') {
        // 值不是布尔类型，返回类型不匹配错误
        context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('boolean', typeof value, context));
        context.terminate = true;
    }
};
exports.BooleanypeProcessor = BooleanypeProcessor;
//# sourceMappingURL=type.js.map