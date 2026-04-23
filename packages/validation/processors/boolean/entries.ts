import { ValidationWeight } from '../../types';
import { BooleanypeProcessor } from './type';

export const booleanTypeProcessorEntry = {
    name: 'boolean-type',
    tags: ['boolean'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: BooleanypeProcessor,
};

