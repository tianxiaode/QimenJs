import { ValidationRegistry } from '../../core';
import {
    ALL_TAGS,
    ValidationContext,
    ValidationProcessorHandler,
    ValidationWeight,
} from '../../types';

export const DefaultProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule, errors } = context;

    // 只有在【没有错误】且【值为空】的情况下才补全默认值
    // 这样既不影响 required 的报错测试，又能保证下游拿到值
    if (errors.length === 0 && (value === undefined || value === null)) {
        if (rule.default !== undefined) {
            context.value = rule.default;
        }
    }
};

ValidationRegistry.register({
    name: 'common-default',
    tags: ALL_TAGS,
    weight: ValidationWeight.RELATION, // 放在 400 阶段，所有单项校验之后
    offset: 100,
    execute: DefaultProcessor,
});
