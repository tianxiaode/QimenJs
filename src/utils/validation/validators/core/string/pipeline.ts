import {
    ValidationErrorContext,
    ValidationResult,
} from '../../../core';
import { StringRule } from '../../../rules';

import { checkStringType } from './type';
import { checkStringLength } from './length';
import { checkStringPattern } from './pattern';
import { checkStringEnum } from './enum';
import { checkPresence } from '../presence';
import { createCoreValidator } from '../factory';

export const validateString = createCoreValidator<StringRule>([
    checkPresence,
    checkStringType,
    checkStringLength,
    checkStringPattern,
    checkStringEnum,
]);
