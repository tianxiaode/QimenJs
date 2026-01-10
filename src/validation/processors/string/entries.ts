import { ValidationWeight } from '../../types';
import { StringTypeProcessor } from './type';
import { StringLengthProcessor } from './length';
import { StringIncludesProcessor } from './includes';
import { StringExcludesProcessor } from './excludes';

// 注册字符串类型验证处理器
export const StringTypeEntry = {
    name: 'string-type',
    tags: ['string', 'password', 'split'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: StringTypeProcessor,
};

// 注册字符串长度验证处理器
export const StringLengthEntry = {
    name: 'string-length',
    tags: ['string', 'password', 'split'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: StringLengthProcessor,
};

// 注册字符串包含验证处理器
export const StringIncludesEntry = {
    name: 'string-includes',
    tags: ['string', 'password'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: StringIncludesProcessor,
};

// 注册字符串排除验证处理器
export const StringExcludesEntry = {
    name: 'string-excludes',
    tags: ['string', 'password'],
    weight: ValidationWeight.SEMANTIC,
    offset: 105,
    execute: StringExcludesProcessor,
};
