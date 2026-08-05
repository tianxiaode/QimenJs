import { PatternRegistrar } from '@qimenjs/pattern';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationProcessorHandler } from '../../types';
import { validatePattern } from '../../utils';

/** 格式验证处理器 */
export const FormatProcessor: ValidationProcessorHandler = async context => {
    const { value, rule } = context;

    const { format, pattern } = rule;

    if (format) {
        const patternRegistrar = PatternRegistrar.getInstance();
        const formatPattern = patternRegistrar.get(format);

        if (!formatPattern) {
            // 在 context 上留下“犯罪现场”记录
            context.metadata = {
                ...context.metadata,
                missingRegistrar: rule.format,
                warning: `[Internal] Format '${rule.format}' not found in registry.`,
            };

            // 返回一个通用的错误，但 code 设置为 INTERNAL_ERROR 类型的子类
            context.errors.push(
                ValidationErrorBuilder.invalid_format(rule.format, value, rule.format, context)
            );
            return;
        }
        validatePattern(value, formatPattern, context, rule.format);
        return;
    }

    if (!pattern) {
        context.errors.push(
            ValidationErrorBuilder.invalid_format(rule.type, value, rule.type, context)
        );
        return;
    }
    validatePattern(value, pattern, context, pattern.toString());
};
