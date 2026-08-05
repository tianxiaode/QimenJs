import { ValidationWeight } from '../../types';
import { SplitProcessor } from './split';

/** 拆分验证处理器注册条目 */
export const SplitProcessorEntry = {
    name: 'string-split',
    tags: ['split'],
    weight: ValidationWeight.STRUCTURAL,
    offset: 10,
    execute: SplitProcessor,
};
