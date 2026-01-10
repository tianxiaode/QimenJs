import { DateTypeProcessor } from './type';
import { DateIsProcessor } from './is';
import { DateWeenendProcessor } from './weekend';
import { DateIncludesProcessor } from './includes';
import { DateExcludesProcessor } from './excludes';

import { ValidationWeight } from '../../types';

export const dateTypeProcessorEntry = {
    name: 'date.type',
    tags: ['date'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: DateTypeProcessor,
};

export const dateIsProcessorEntry = {
    name: 'date-is',
    tags: ['date'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: DateIsProcessor,
};

export const dateWeekendProcessorEntry = {
    name: 'date.weekend',
    tags: ['date'],
    weight: ValidationWeight.SEMANTIC,
    offset: 105,
    execute: DateWeenendProcessor,
};

export const dateIncludesProcessorEntry = {
    name: 'date-includes',
    tags: ['date'],
    weight: ValidationWeight.RELATION,
    offset: 110,
    execute: DateIncludesProcessor,
};

export const dateExcludesProcessorEntry = {
    name: 'date-excludes',
    tags: ['date'],
    weight: ValidationWeight.RELATION,
    offset: 115,
    execute: DateExcludesProcessor,
};
