import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler } from '../../types';

/** 存在性检查验证处理器 */
export const PresenceProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { rule, status, value } = context;

    // --- 守卫 1：必填检查 ---
    if (rule.required && status.isUndefined) {
        context.errors.push(ValidationErrorBuilder.required(context));
        context.terminate = true; // 既然没传，后面什么 type、format 都没法验，直接熔断
        return;
    }

    // --- 守卫 2：Null 容忍逻辑 ---
    if (status.isNull) {
        //如果是null值，无论是否允许null，都直接返回
        if (!rule.nullable) {
            //如果不允许null，则视为错误
            context.errors.push(
                ValidationErrorBuilder.invalid_value(value, { ...context, expected: 'non-null' })
            );
        }
        context.terminate = true; // 允许为 null，则视为合法终点，跳过后续所有校验
        return;
    }

    // --- 守卫 3：空内容检查 ---
    // 注意：只有在值存在且非 null 时，才检查是否为空（如空字符串）
    if (rule.empty === false && status.isEmpty) {
        context.errors.push(
            ValidationErrorBuilder.invalid_value(value, { ...context, expected: 'non-empty' })
        );
    }
};
