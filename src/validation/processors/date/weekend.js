"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateWeenendProcessor = void 0;
const errors_1 = require("../../errors");
const DateWeenendProcessor = async (context) => {
    const { value, rule } = context;
    if (rule.weekend === undefined && !rule.weekend)
        return;
    const weekendDays = Array.isArray(rule.weekend) ? rule.weekend : [rule.weekend];
    // 将输入值转换为 Date 对象
    const date = new Date(value);
    // 获取日期的星期几（0-6，其中0表示周日）
    const dayOfWeek = date.getDay();
    // 检查当前日期是否为指定的周末日期之一
    if (weekendDays.includes(dayOfWeek)) {
        // 日期是周末，验证通过
        return;
    }
    context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, {
        ...context,
        expected: 'weekend',
        allowedValues: weekendDays,
    }));
};
exports.DateWeenendProcessor = DateWeenendProcessor;
//# sourceMappingURL=weekend.js.map