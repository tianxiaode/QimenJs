"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateIsProcessor = void 0;
const errors_1 = require("../../errors");
// 日期is验证谓词映射对象 - 只定义需要验证的类型
const dateIsPredicates = {
    // 验证是否为将来日期
    future: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value.getTime() > today.getTime();
    },
    // 验证是否为过去日期
    past: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value.getTime() < today.getTime();
    },
    // 验证是否为今天
    today: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const valueDate = new Date(value);
        valueDate.setHours(0, 0, 0, 0);
        return valueDate.getTime() === today.getTime();
    },
    // 验证是否为昨天
    yesterday: (value) => {
        const yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);
        const valueYesterday = new Date(value);
        valueYesterday.setHours(0, 0, 0, 0);
        return valueYesterday.getTime() === yesterday.getTime();
    },
    // 验证是否为明天
    tomorrow: (value) => {
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const valueTomorrow = new Date(value);
        valueTomorrow.setHours(0, 0, 0, 0);
        return valueTomorrow.getTime() === tomorrow.getTime();
    },
};
const DateIsProcessor = async (context) => {
    const { value, rule } = context;
    //不要做任何防御，要相信上一处理器
    // 2. 直接遍历需要检查的关键字段名
    // 这样做的好处：代码量骤减，且不需要在循环体外手动解构 rule
    const checkKeys = ['future', 'past', 'today', 'tomorrow', 'yesterday'];
    for (const key of checkKeys) {
        // 只有当规则中明确设为 true 时才校验
        if (rule[key] === true) {
            const isValid = dateIsPredicates[key](value);
            if (!isValid) {
                context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: key // 错误信息直接使用 key 名，非常直观
                }));
                // 思考：这里要不要 terminate? 
            }
        }
    }
};
exports.DateIsProcessor = DateIsProcessor;
//# sourceMappingURL=is.js.map