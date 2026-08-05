import { ValidationErrorBuilder } from '../../errors';
import { doValidate } from '../../core';
import { ValidationProcessorHandler } from '../../types';

/** 数组子项验证处理器 */
export const ArrayChildrenProcessor: ValidationProcessorHandler = async context => {
    const { value, rule, path } = context;
    if (!rule.itemRule || !Array.isArray(value)) return;

    const { itemRule, allowEmptyItem } = rule;

    const tasks = value.map(async (item, index) => {
        // 1. 习惯行为：跳过空项
        if (allowEmptyItem && (item === null || item === undefined || item === '')) {
            return;
        }

        const childPath = `${path}[${index}]`;

        // 2. 路径 A: 如果是自定义函数，直接执行
        if (typeof itemRule === 'function') {
            const result = await itemRule(value, index, itemRule, context);
            if (result !== true && result !== null) {
                context.errors.push(
                    ValidationErrorBuilder.invalid_value(value, {
                        ...context,
                        path: childPath,
                        itemResult: result,
                    })
                );
            }
            return;
        }

        // 3. 路径 B: 如果是标准 Rule，递归调用
        await doValidate(item, itemRule, {
            ...context,
            path: childPath,
            errors: context.errors, // 共享桶
            terminate: false,
        });
    });

    await Promise.all(tasks);
};
