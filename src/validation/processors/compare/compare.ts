import { smartCompare } from '../../utils';
import { ValidationContext, ValidationProcessorHandler } from '../../types';
import { ValidationErrorBuilder } from '../../errors';

const operators: Record<string, (res: number) => boolean> = {
    '=': r => r === 0,
    '!=': r => r !== 0,
    '>': r => r > 0,
    '>=': r => r >= 0,
    '<': r => r < 0,
    '<=': r => r <= 0,
};

export const CompareProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;
    const { target, operator, strict, field = '' } = rule;

    const targetValue = typeof target === 'function' ? target(rule) : target;

    // 2. 执行智能比较，返回比较结果
    // 返回值: NaN(无法比较)、-1(小于)、0(等于)、1(大于)
    const result = smartCompare(value, targetValue, strict);
    if (Number.isNaN(result)) {
        context.errors.push(
            ValidationErrorBuilder.invalid_value('target', {
                ...context,
                expectedType: 'comparable value',
            })
        );
        return;
    }

    // 依然不防御：如果 operator 写错了（如 '=='），这里直接抛错
    const pass = operators[operator](result);

    if (!pass) {
        context.errors.push(
            ValidationErrorBuilder.condition_failed(field, operator, value, {
                target: target,
                operator: operator,
            })
        );
    }
};
