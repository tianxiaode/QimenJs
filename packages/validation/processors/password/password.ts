import { validatePattern } from '../../utils';
import { ValidationContext, ValidationPatternType, ValidationProcessorHandler } from '../../types';
import { Registry } from '@orbitjs/registry';

export const PasswordProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    const patterns = [
        ValidationPatternType.UPPERCASE,
        ValidationPatternType.LOWERCASE,
        ValidationPatternType.DIGIT,
        ValidationPatternType.SPECIAL_CHAR,
    ];

    for (const name of patterns) {
        if ((rule as any)[name] === true) {
            const regex = Registry.pattern.get(name);
            validatePattern(value, regex!, context, name);
        }
    }
};
