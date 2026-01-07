import { doValidate, ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationContext, ValidationProcessorHandler, ValidationWeight } from '../../types';

export const ObjectPropertiesProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rule, path } = context;

    //不需要做任何防御，相信上一处理器

    // 基础守卫：非对象或无属性定义则跳过
    if (!rule.properties) return;

    const { properties } = rule;

    // 遍历定义的所有属性
    const tasks = Object.keys(properties).map(async key => {
        const propRule = properties[key];
        const propValue = value[key];
        const childPath = path ? `${path}.${key}` : key;

        // 1. 路径 A: 自定义校验函数
        if (typeof propRule === 'function') {
            const result = await propRule(propValue, key, value, context);
            if (result !== true && result !== null) {
                context.errors.push(
                    ValidationErrorBuilder.invalid_value(value, {
                        context,
                        path: childPath,
                        property: key,
                        propertyResult: result,
                    })
                );
            }
            return;
        }

        // 2. 路径 B: 标准规则（支持单条或数组）
        // 这里直接递归回顶层的 doValidate 或 validate 函数
        // 如果 propRule 是数组，递归入口会自动处理规则链
        await doValidate(propValue, propRule, {
            ...context,
            path: childPath,
            errors: context.errors, // 共享错误桶
            terminate: false, // 属性间的中断互不影响
        });
    });

    await Promise.all(tasks);
};

ValidationRegistry.register({
    name: 'object-properties',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 110,
    execute: ObjectPropertiesProcessor,
});
