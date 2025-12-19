// validators/common/compare/validateCompare.ts
import { smartCompare } from '../../../core';
import { ValidationErrorBuilder, ValidatorResult } from '../../../core';
import { CompareOperator } from './types';

interface ValidateCompareOptions {
    operator: CompareOperator;
    strict?: boolean;
    context?: any;
}

export function validateCompare(
    value: any,
    other: any,
    options: ValidateCompareOptions
): ValidatorResult {
    const { operator, strict = true, context } = options;

    const result = smartCompare(value, other, strict);

    // 无法比较
    if (Number.isNaN(result)) {
        return ValidationErrorBuilder.invalid_value(value, context);
    }

    let valid = false;

    switch (operator) {
        case 'eq':
            valid = result === 0;
            break;
        case 'neq':
            valid = result !== 0;
            break;
        case 'gt':
            valid = result > 0;
            break;
        case 'gte':
            valid = result >= 0;
            break;
        case 'lt':
            valid = result < 0;
            break;
        case 'lte':
            valid = result <= 0;
            break;
    }

    if (!valid) {
        return ValidationErrorBuilder.condition_failed(
            context?.field,
            operator,
            { value, other },
            context
        );
    }

    return null;
}

