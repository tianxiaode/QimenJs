import { ValidationWeight } from '../../types';
import { FormatProcessor } from './format';

// 注册字符串类型验证处理器
export const FormatProcessorEntry = {
    name: 'format-type',
    tags: ['format'],
    weight: ValidationWeight.SEMANTIC,
    offset: 70,
    execute: FormatProcessor,
};
