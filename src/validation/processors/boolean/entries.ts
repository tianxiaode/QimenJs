import { ValidationWeight } from '../../types';
import { BooleanypeProcessor } from './type';

/** 布尔类型验证处理器注册条目 */
export const booleanTypeProcessorEntry = {
    name: 'boolean-type',
    tags: ['boolean'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: BooleanypeProcessor,
};
