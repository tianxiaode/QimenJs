import { ValidationErrorContext, ValidationResult } from '../../../core';
import { BooleanRule } from '../../../rules';

import { checkBooleanType } from './type';
import { checkBooleanEnum } from './enum';
import { checkPresence } from '../presence';
import { createCoreValidator } from '../factory';

export const validateBoolean = createCoreValidator<BooleanRule>([
    checkPresence,
    checkBooleanType,
    checkBooleanEnum,
]);
