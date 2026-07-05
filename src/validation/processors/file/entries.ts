import { ValidationWeight } from '../../types';
import { FileProcessor } from './file';

export const FileProcessorEntry = {
    name: 'file',
    tags: ['file'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: FileProcessor,
};
