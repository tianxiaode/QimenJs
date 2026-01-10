import {
    ValidationContext,
    ValidationProcessorHandler,
} from '../../types';

/** * 规则对齐预处理器 (RuleAlignmentProcessor)
 * 职责：根据 Rule 的类型和特定字段，补充缺失的默认行为。
 */
export const RuleAlignmentProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
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
};

