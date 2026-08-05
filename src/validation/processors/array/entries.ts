import { ValidationWeight } from '../../types';
import { ArrayChildrenProcessor } from './children';
import { ArrayExcludesProcessor } from './excludes';
import { ArrayIncludesProcessor } from './includes';
import { ArrayLengthProcessor } from './length';
import { ArrayTypeProcessor } from './type';
import { ArrayUniqueProcessor } from './unique';
import { ArrayUniqueByProcessor } from './uniqueBy';

/** 数组类型验证处理器注册条目 */
export const arrayTypeProcessorEntry = {
    name: 'array-type',
    tags: ['array'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: ArrayTypeProcessor,
};

/** 数组长度验证处理器注册条目 */
export const arrayLengthProcessorEntry = {
    name: 'array-length',
    tags: ['array'],
    execute: ArrayLengthProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
};

/** 数组包含值验证处理器注册条目 */
export const arrayIncludesProcessorEntry = {
    name: 'array-includes',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: ArrayIncludesProcessor,
};

/** 数组排除值验证处理器注册条目 */
export const arrayExcludesProcessorEntry = {
    name: 'array-excludes',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 105,
    execute: ArrayExcludesProcessor,
};

/** 数组子项验证处理器注册条目 */
export const arrayChildrenProcessorEntry = {
    name: 'array-children',
    tags: ['array'],
    weight: ValidationWeight.SEMANTIC,
    offset: 110,
    execute: ArrayChildrenProcessor,
};

/** 数组唯一性验证处理器注册条目 */
export const arrayUniqueProcessorEntry = {
    name: 'array-unique',
    tags: ['array'],
    execute: ArrayUniqueProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 150,
};

/** 数组按字段唯一性验证处理器注册条目 */
export const arrayUniqueByProcessorEntry = {
    name: 'array-unique-by',
    tags: ['array'],
    execute: ArrayUniqueByProcessor,
    weight: ValidationWeight.SEMANTIC,
    offset: 155,
};
