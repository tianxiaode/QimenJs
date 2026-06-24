"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitProcessor = void 0;
const core_1 = require("../../core");
const errors_1 = require("../../errors");
const SplitProcessor = async (context) => {
    var _a;
    const { value, rule, path } = context;
    // 1. 拆分逻辑
    if (typeof value !== 'string' || !rule.separator)
        return;
    let items = value.split(rule.separator);
    // 2. 清洗逻辑 (保留你原来的 rule.trim 配置)
    if (rule.trim) {
        items = items.map(v => v.trim());
    }
    // 3. 空项校验 (你的特色逻辑，很有必要)
    if (!rule.allowEmptyItem && items.some(v => v === '')) {
        context.errors.push(errors_1.ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'non-empty items'
        }));
        if (!rule.allErrors)
            return;
    }
    // --- 核心转变：构建虚拟数组规则并委托 ---
    const virtualArrayRule = {
        type: 'array',
        // 映射数量校验：你的 minItems/maxItems 直接映射给数组的 min/max
        min: rule.minItems,
        max: rule.maxItems,
        // 映射子项规则：你的 itemRule 对应数组的 items
        itemRule: rule.itemRule,
        // 映射错误控制
        allErrors: (_a = rule.allItemsError) !== null && _a !== void 0 ? _a : rule.allErrors
    };
    // 让专门的 Array 处理器去跑后续的：
    // - 数量校验 (LengthProcessor: 3000)
    // - 子项循环验证 (ArrayProcessor: 5000)
    const result = await (0, core_1.doValidate)(items, virtualArrayRule, { path });
    context.errors.push(...result.errors);
};
exports.SplitProcessor = SplitProcessor;
//# sourceMappingURL=split.js.map