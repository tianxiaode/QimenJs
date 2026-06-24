"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateIncludesProcessor = void 0;
const errors_1 = require("../../errors");
const DateIncludesProcessor = async (context) => {
    const { value, rule } = context;
    //不要做任何防御，要相信上一处理器
    // --- 核心逻辑：枚举值验证 ---
    // 检查是否存在 includes 规则
    if (rule.includes === undefined)
        return;
    // 获取允许的值列表，支持函数形式
    const includesValues = typeof rule.includes === 'function' ? rule.includes(rule) : rule.includes;
    if (Array.isArray(includesValues)) {
        // 检查当前值是否在允许数组中
        // 对于日期，我们需要比较时间戳来判断是否相等
        const isInclude = includesValues.some(includeDate => value.getTime() === includeDate.getTime());
        if (!isInclude) {
            context.errors.push(errors_1.ValidationErrorBuilder.not_allowed(value, includesValues, context));
        }
    }
};
exports.DateIncludesProcessor = DateIncludesProcessor;
//# sourceMappingURL=includes.js.map