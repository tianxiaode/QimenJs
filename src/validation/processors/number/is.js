"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberIsProcessor = void 0;
const errors_1 = require("../../errors");
const numberIsPredicates = {
    integer: (v) => Number.isInteger(v),
    positive: (v) => v > 0,
    negative: (v) => v < 0,
    even: (v) => Number.isInteger(v) && v % 2 === 0,
    odd: (v) => Number.isInteger(v) && v % 2 !== 0,
};
const NumberIsProcessor = async (context) => {
    const { value, rule } = context;
    // 2. 直接遍历需要检查的关键字段名
    // 这样做的好处：代码量骤减，且不需要在循环体外手动解构 rule
    const checkKeys = ['integer', 'positive', 'negative', 'even', 'odd'];
    for (const key of checkKeys) {
        // 只有当规则中明确设为 true 时才校验
        if (rule[key] === true) {
            const isValid = numberIsPredicates[key](value);
            if (!isValid) {
                context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: key // 错误信息直接使用 key 名，非常直观
                }));
                // 思考：这里要不要 terminate? 
                // 既然已经确定是数字，语义错误通常可以并行收集，除非你希望只要有一个不对就停下
            }
        }
    }
};
exports.NumberIsProcessor = NumberIsProcessor;
//# sourceMappingURL=is.js.map