import * as primitiveRules from './primitives';
import * as constraintRules from './constraints';
import * as patternRules from './patterns';
import * as structureRules from './structures';

export const Validation = {
    ...primitiveRules,
    ...constraintRules,
    ...patternRules,
    ...structureRules
};

