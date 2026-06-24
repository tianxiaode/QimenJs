"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePattern = void 0;
const errors_1 = require("../errors");
/**
 * 核心正则匹配助手
 * @returns boolean 表示是否通过，内部自动处理错误压栈
 */
const validatePattern = (value, regex, context, expected // 预期类型
) => {
    //不要做任何防御，相信传递过滤的参数，直接报错比隐藏错误更好
    if (!regex.test(String(value))) {
        context.errors.push(errors_1.ValidationErrorBuilder.pattern_mismatch(regex.source, value, { context, expected }));
        return false;
    }
    return true;
};
exports.validatePattern = validatePattern;
//# sourceMappingURL=pattern.js.map