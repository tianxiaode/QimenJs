import { isEmptyValue } from '../../utils';
import { ValidationErrorBuilder } from '../../errors';
import {
    ALL_TAGS,
    ValidationContext,
    ValidationProcessorHandler,
    ValidationWeight,
} from '../../types';
import { ValidationRegistry } from '../../core';

export const PresenceProcessor: ValidationProcessorHandler = (context: ValidationContext) => {
    const { value, rule } = context;

    // 1. 必填检查 (Required)
    // 如果是 undefined 且必填，直接报错
    if (rule.required && value === undefined) {
        context.errors.push(ValidationErrorBuilder.required(context));
    }

    // 2. 空值放行逻辑 (The Magic of Nullable)
    // 如果值是 null 且 rule.nullable 为 true，直接标记中断并返回
    if (value === null && rule.nullable === true) {
        context.isTerminated = true; // 告诉调度器：后面那些 min/max/pattern 不用跑了
        return Promise.resolve();
    }

    // 3. 严格 Null 检查 (Nullable: false)
    if (value === null && rule.nullable === false) {
        context.errors.push(
            ValidationErrorBuilder.invalid_value(value, { ...context, expected: 'non-null' })
        );
    }

    // 4. 空性检查 (Empty)
    if (rule.empty === false && isEmptyValue(value)) {
        context.errors.push(
            ValidationErrorBuilder.invalid_value(value, { ...context, expected: 'non-empty' })
        );
    }

    return Promise.resolve();
};

ValidationRegistry.register({
    name: 'Presence',
    tags: ALL_TAGS,
    weight: ValidationWeight.PRESENCE,
    offset: 100,
    execute: PresenceProcessor,
});
