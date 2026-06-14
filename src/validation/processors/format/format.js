"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatProcessor = void 0;
const registry_1 = require("@orbitjs/registry");
const errors_1 = require("../../errors");
const utils_1 = require("../../utils");
const FormatProcessor = async (context) => {
    const { value, rule } = context;
    const { format, pattern } = rule;
    if (format) {
        const formatPattern = registry_1.Registry.pattern.get(format);
        if (!formatPattern) {
            // 在 context 上留下“犯罪现场”记录
            context.metadata = {
                ...context.metadata,
                missingRegistrar: rule.format,
                warning: `[Internal] Format '${rule.format}' not found in registry.`,
            };
            // 返回一个通用的错误，但 code 设置为 INTERNAL_ERROR 类型的子类
            context.errors.push(errors_1.ValidationErrorBuilder.invalid_format(rule.format, value, rule.format, context));
            return;
        }
        (0, utils_1.validatePattern)(value, formatPattern, context, rule.format);
        return;
    }
    if (!pattern) {
        context.errors.push(errors_1.ValidationErrorBuilder.invalid_format(rule.type, value, rule.type, context));
        return;
    }
    (0, utils_1.validatePattern)(value, pattern, context, pattern.toString());
};
exports.FormatProcessor = FormatProcessor;
//# sourceMappingURL=format.js.map