import { ValidationWeight } from '../../types';
import { SplitProcessor } from './split';

// 注册字符串类型验证处理器
export const StringTypeEntry = {
    name: 'string-split',
    tags: ['split'],
    weight: ValidationWeight.STRUCTURAL,
    offset: 10,
    execute: SplitProcessor,
};

