"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleAlignmentProcessor = void 0;
const registry_1 = require("@orbitjs/registry");
/** * 规则对齐预处理器 (RuleAlignmentProcessor)
 * 职责：根据 Rule 的类型和特定字段，补充缺失的默认行为。
 */
const RuleAlignmentProcessor = async (context) => {
    const { rule } = context;
    if (rule.type === 'file') {
        // 强制对齐规则，确保后续 Processor 不用判断 undefined
        // 这消灭了"必填但允许上传 0 个文件"的逻辑悖论
        if (!rule.minFiles || rule.minFiles < 1) {
            rule.minFiles = 1;
        }
        rule.allowedTypes = rule.allowedTypes || [];
        rule.allowedExtensions = rule.allowedExtensions || [];
    }
    if (rule.type === 'password') {
        // 全部用全局定义对齐规则，确保后续 Processor 不用判断 undefined
        const { minLength, maxLength, uppercase, lowercase, digit, specialChar } = registry_1.Registry.system.get('password');
        rule.minLength = minLength;
        rule.maxLength = maxLength;
        rule.uppercase = uppercase;
        rule.lowercase = lowercase;
        rule.digit = digit;
        rule.specialChar = specialChar;
    }
};
exports.RuleAlignmentProcessor = RuleAlignmentProcessor;
//# sourceMappingURL=rule-align.js.map