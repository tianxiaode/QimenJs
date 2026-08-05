import { DateTypeProcessor } from './type';
import { DateIsProcessor } from './is';
import { DateWeenendProcessor } from './weekend';
import { DateIncludesProcessor } from './includes';
import { DateExcludesProcessor } from './excludes';

import { ValidationWeight } from '../../types';

/** 日期类型验证处理器注册条目 */
export const dateTypeProcessorEntry = {
    name: 'date.type',
    tags: ['date'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: DateTypeProcessor,
};

/** 日期条件判断验证处理器注册条目 */
export const dateIsProcessorEntry = {
    name: 'date-is',
    tags: ['date'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: DateIsProcessor,
};

/** 日期周末验证处理器注册条目 */
export const dateWeekendProcessorEntry = {
    name: 'date.weekend',
    tags: ['date'],
    weight: ValidationWeight.SEMANTIC,
    offset: 105,
    execute: DateWeenendProcessor,
};

/** 日期包含值验证处理器注册条目 */
export const dateIncludesProcessorEntry = {
    name: 'date-includes',
    tags: ['date'],
    weight: ValidationWeight.RELATION,
    offset: 110,
    execute: DateIncludesProcessor,
};

/** 日期排除值验证处理器注册条目 */
export const dateExcludesProcessorEntry = {
    name: 'date-excludes',
    tags: ['date'],
    weight: ValidationWeight.RELATION,
    offset: 115,
    execute: DateExcludesProcessor,
};
