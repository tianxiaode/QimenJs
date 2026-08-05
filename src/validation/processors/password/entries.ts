import { ValidationWeight } from '../../types';
import { PasswordProcessor } from './password';

/** 密码验证处理器注册条目 */
export const PasswordProcessorEntry = {
    name: 'password',
    tags: ['password'],
    weight: ValidationWeight.SEMANTIC,
    offset: 70,
    processor: PasswordProcessor,
};
