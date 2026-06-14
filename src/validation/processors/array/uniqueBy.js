"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUniqueByProcessor = void 0;
const errors_1 = require("../../errors");
const ArrayUniqueByProcessor = async (context) => {
    const { value, rule } = context;
    // 如果不是数组或未设置uniqueBy参数，跳过验证
    if (rule.uniqueBy === undefined)
        return;
    // uniqueBy可以是一个字符串（属性名）或一个函数
    const { uniqueBy } = rule;
    // 创建用于提取比较键的函数
    // 如果 uniqueBy 是字符串，则创建访问该属性的函数
    // 如果 uniqueBy 是函数，则直接使用该函数
    const getter = typeof uniqueBy === 'function' ? uniqueBy : (item) => item === null || item === void 0 ? void 0 : item[uniqueBy];
    // 使用 Set 跟踪已见过的键值，提供 O(1) 的查找性能
    const seen = new Set();
    // 遍历数组检查唯一性
    for (const item of value) {
        try {
            // 获取用于比较的键值
            // 对于每个数组元素，使用 getter 函数提取比较键
            const key = getter(item);
            // 检查是否已存在相同的键值
            // 如果 Set 中已存在该键值，说明出现了重复，返回错误
            if (seen.has(key)) {
                context.errors.push(errors_1.ValidationErrorBuilder.duplicate('array', key, context));
                if (!rule.allItemsError)
                    return;
            }
            // 将键值添加到 Set 中，用于后续比较
            seen.add(key);
        }
        catch (error) {
            // 如果 getter 函数执行出错（例如访问不存在的属性），返回错误
            context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(item, {
                ...context,
                message: `Failed to extract unique key: ${error instanceof Error ? error.message : String(error)}`,
            }));
            if (!rule.allItemsError)
                return;
        }
    }
};
exports.ArrayUniqueByProcessor = ArrayUniqueByProcessor;
//# sourceMappingURL=uniqueBy.js.map