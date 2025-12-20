import { ValidationErrorContext, ValidationResult } from '../../../core';
import { NumberRule } from '../../../rules';

import { checkNumberType } from './type';
import { checkNumberInteger } from './integer';
import { checkNumberRange } from './range';
import { checkNumberEnum } from './enum';
import { checkPresence } from '../presence';
import { createCoreValidator } from '../factory';

export const validateNumber = createCoreValidator<NumberRule>([
    checkPresence,
    checkNumberType,
    checkNumberInteger,
    checkNumberRange,
    checkNumberEnum,
]);
