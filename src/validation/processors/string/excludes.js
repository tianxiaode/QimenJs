"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringExcludesProcessor = void 0;
const errors_1 = require("../../errors");
const StringExcludesProcessor = async (context) => {
    const { value, rule } = context;
    //不要做任何防御，要相信上一处理器已经确认值为字符串，且不是null，否则会隐藏流水线逻辑错误
    // --- 核心逻辑：排除值验证 ---
    // 检查是否存在 excludes 规则
    if (rule.excludes === undefined)
        return;
    // 获取排除的值列表，支持函数形式
    const excludesValues = typeof rule.excludes === 'function' ? rule.excludes(rule) : rule.excludes;
    if (Array.isArray(excludesValues)) {
        // 检查当前值是否在排除数组中
        if (excludesValues.includes(value)) {
            context.errors.push(errors_1.ValidationErrorBuilder.not_allowed(value, excludesValues, context));
        }
    }
};
exports.StringExcludesProcessor = StringExcludesProcessor;
//# sourceMappingURL=excludes.js.map