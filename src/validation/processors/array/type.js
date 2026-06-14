"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayTypeProcessor = void 0;
const errors_1 = require("../../errors");
const ArrayTypeProcessor = async (context) => {
    const { value } = context;
    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误
    // 检查值是否为数组类型，如果不是则返回类型不匹配错误
    if (!Array.isArray(value)) {
        context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('array', typeof value, context));
        context.terminate = true;
    }
};
exports.ArrayTypeProcessor = ArrayTypeProcessor;
//# sourceMappingURL=type.js.map