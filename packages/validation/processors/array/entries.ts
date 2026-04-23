import { ValidationWeight } from '../../types';
import { ArrayChildrenProcessor } from './children';
import { ArrayExcludesProcessor } from './excludes';
import { ArrayIncludesProcessor } from './includes';
import { ArrayLengthProcessor } from './length';
import { ArrayTypeProcessor } from './type';
import { ArrayUniqueProcessor } from './unique';
import { ArrayUniqueByProcessor } from './uniqueBy';

export const arrayTypeProcessorEntry = {
    name: 'array-type',
    tags: ['array'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: ArrayTypeProcessor,
};

export const arrayLengthProcessorEntry = {
    name: 'array-length',
    tags: ['array'],
    execute: ArrayLengthProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
};

export const arrayIncludesProcessorEntry = {
    name: 'array-includes',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: ArrayIncludesProcessor,
};

export const arrayExcludesProcessorEntry = {
    name: 'array-excludes',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 105,
    execute: ArrayExcludesProcessor,
};

export const arrayChildrenProcessorEntry = {
    name: 'array-children',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 110,
    execute: ArrayChildrenProcessor,
};

export const arrayUniqueProcessorEntry = {
    name: 'array-unique',
    tags: ['array'],
    execute: ArrayUniqueProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 150,
};

export const arrayUniqueByProcessorEntry = {
    name: 'array-unique-by',
    tags: ['array'],
    execute: ArrayUniqueByProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 155,
};