import { ValidationRegistry } from '@/validation/core/ValidationRegistry';
import {
    ALL_TAGS,
    ValidationContext,
    ValidationProcessorHandler,
    ValidationWeight,
} from '../../types';

/** * 规则对齐预处理器 (RuleAlignmentProcessor)
 * 职责：根据 Rule 的类型和特定字段，补充缺失的默认行为。
 */
export const RuleAlignmentProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { rule } = context;

    // 1. 针对特定类型的“硬性对齐”
    // 比如：文件类型或格式化类型，通常默认就是必填且非空的
    if (['password', 'file', 'image', 'blob', 'buffer', 'split', 'format'].includes(rule.type)) {
        rule.required = true;
        rule.nullable = false;
        rule.allowEmpty = false;
    }
};

ValidationRegistry.register({
    name: 'common-rule-align',
    tags: ALL_TAGS,
    weight: ValidationWeight.PREPARATION,
    offset: 0,
    execute: RuleAlignmentProcessor,
});
