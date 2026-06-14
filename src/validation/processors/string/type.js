"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringTypeProcessor = void 0;
const errors_1 = require("../../errors");
const StringTypeProcessor = async (context) => {
    const { value } = context;
    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误
    // 验证字符串类型
    if (typeof value !== 'string') {
        context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('string', typeof value, context));
        // 【关键】一旦类型不对，后续针对字符串的语义校验（长度、正则等）全无意义，直接中断
        context.terminate = true;
    }
};
exports.StringTypeProcessor = StringTypeProcessor;
//# sourceMappingURL=type.js.map