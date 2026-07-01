import { validatePattern } from '../../utils';
import { ValidationContext, ValidationPatternType, ValidationProcessorHandler } from '../../types';
import { PatternRegistrar } from '@orbitjs/pattern';

export const PasswordProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;

    //不要做任何防御，要相信上一处理器

    const patterns = [
        ValidationPatternType.UPPERCASE,
        ValidationPatternType.LOWERCASE,
        ValidationPatternType.DIGIT,
        ValidationPatternType.SPECIAL_CHAR,
    ];

    const patternRegistrar = PatternRegistrar.getInstance();
    
    for (const name of patterns) {
        if ((rule as any)[name] === true) {
            const regex = patternRegistrar.get(name);
            validatePattern(value, regex!, context, name);
        }
    }
};
