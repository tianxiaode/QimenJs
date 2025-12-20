import { ValidationErrorContext, ValidationResult } from '../../../core';
import { DateRule } from '../../../rules';

import { checkDateType } from './type';
import { checkDateRange } from './range';
import { createCoreValidator } from '../factory';
import { checkPresence } from '../presence';

export const validateDate = createCoreValidator<DateRule>([
    checkPresence,
    checkDateType,
    checkDateRange,
]);
