import { ValidationWeight } from '../../types';
import { StringTypeProcessor } from './type';
import { StringLengthProcessor } from './length';
import { StringIncludesProcessor } from './includes';
import { StringExcludesProcessor } from './excludes';

/** 字符串类型验证处理器注册条目 */
export const StringTypeEntry = {
    name: 'string-type',
    tags: ['string', 'password', 'split', 'format'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: StringTypeProcessor,
};

/** 字符串长度验证处理器注册条目 */
export const StringLengthEntry = {
    name: 'string-length',
    tags: ['string', 'password', 'split', 'format'],
    weight: ValidationWeight.SEMANTIC,
    offset: 50,
    execute: StringLengthProcessor,
};

/** 字符串包含值验证处理器注册条目 */
export const StringIncludesEntry = {
    name: 'string-includes',
    tags: ['string', 'password', 'format'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: StringIncludesProcessor,
};

/** 字符串排除值验证处理器注册条目 */
export const StringExcludesEntry = {
    name: 'string-excludes',
    tags: ['string', 'password', 'format'],
    weight: ValidationWeight.SEMANTIC,
    offset: 105,
    execute: StringExcludesProcessor,
};
