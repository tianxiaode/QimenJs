import { validatePattern } from '../../utils';
import { doValidate, ValidationRegistry } from '../../core';
import {
    ValidationContext,
    ValidationPatternType,
    ValidationProcessorHandler,
    ValidationWeight,
} from '../../types';

export const PasswordProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    await doValidate(value, rule, context);

    if (context.errors.length > 0) {
        return;
    }

    const patterns = [
        ValidationPatternType.UPPERCASE,
        ValidationPatternType.LOWERCASE,
        ValidationPatternType.DIGIT,
        ValidationPatternType.SPECIAL_CHAR,
    ];

    for (const name of patterns) {
        if ((rule as any)[name] === true) {
            const regex = ValidationRegistry.getPattern(name);
            validatePattern(value, regex!, context, name);
        }
    }
};

ValidationRegistry.register({
    name: 'password',
    tags: ['password'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: PasswordProcessor,
});
