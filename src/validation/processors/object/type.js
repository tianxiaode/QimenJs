"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeProcessor = void 0;
const errors_1 = require("../../errors");
const ObjectTypeProcessor = async (context) => {
    const { value } = context;
    //不需要做任何防御，相信上一处理器已经把null值处理了，避免流水线隐性错误
    // 检查值是否为对象类型，并且不是数组
    // typeof value !== 'object' - 确保值是对象类型（排除基本类型）
    // Array.isArray(value) - 排除数组类型，数组虽然是对象但在此被视为独立类型
    if (typeof value !== 'object' || Array.isArray(value)) {
        // 值不是纯对象类型，返回类型不匹配错误
        // 错误信息包含期望的类型('object')和实际的类型
        context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('object', typeof value, context));
        context.terminate = true;
    }
};
exports.ObjectTypeProcessor = ObjectTypeProcessor;
//# sourceMappingURL=type.js.map