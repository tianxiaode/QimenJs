import { ValidationWeight } from '../../types';
import { CompareProcessor } from './compare';

const CompareProcessorEntry = {
    name: 'compare',
    tags: ['compare'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: CompareProcessor,
};
