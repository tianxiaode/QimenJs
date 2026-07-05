import { ValidationWeight } from '@/validation/types';
import { PasswordProcessor } from './password';

export const PasswordProcessorEntry = {
    name: 'password',
    tags: ['password'],
    weight: ValidationWeight.SEMANTIC,
    offset: 70,
    processor: PasswordProcessor,
};
