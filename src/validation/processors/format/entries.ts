import { ValidationWeight } from '../../types';
import { FormatProcessor } from './format';

/** 格式验证处理器注册条目 */
export const FormatProcessorEntry = {
    name: 'format-type',
    tags: ['format'],
    weight: ValidationWeight.SEMANTIC,
    offset: 70,
    execute: FormatProcessor,
};
