import { RefreshContextStatusProcessor } from './context';
import { RuleAlignmentProcessor } from './rule-align';
import { TransformProcessor } from './transform';
import { TrimProcessor } from './trim';
import { PresenceProcessor } from './presence';

import { ValidationWeight, ALL_TAGS } from '../../types';

export const ruleAlignmentProcessorEntry = {
    name: 'common-rule-align',
    tags: ALL_TAGS,
    weight: ValidationWeight.PREPARATION,
    offset: 0,
    execute: RuleAlignmentProcessor,
};

export const transformProcessorEntry = {
    name: 'common-transform',
    tags: ALL_TAGS,
    weight: ValidationWeight.PREPARATION,
    offset: 10,
    execute: TransformProcessor,
};

export const trimProcessorEntry = {
    name: 'Trim',
    tags: ALL_TAGS,
    weight: ValidationWeight.PREPARATION,
    offset: 20,
    execute: TrimProcessor,
};

export const refreshContextStatusProcessorEntry = {
    name: 'common-refrence-context-status',
    tags: ALL_TAGS,
    weight: ValidationWeight.PREPARATION,
    offset: 30,
    execute: RefreshContextStatusProcessor,
};

export const presenceProcessorEntry = {
    name: 'common-presence',
    tags: ALL_TAGS,
    weight: ValidationWeight.PRESENCE,
    offset: 100,
    execute: PresenceProcessor,
};
