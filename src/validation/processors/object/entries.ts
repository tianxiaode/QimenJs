import { ValidationWeight } from '../../types';
import { ObjectTypeProcessor } from './type';
import { ObjectRequiredFieldsProcessor } from './required-fields';
import { ObjectPropertiesProcessor } from './properties';

/** 对象类型验证处理器注册条目 */
export const ObjectTypeEntry = {
    name: 'object-type',
    tags: ['object'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: ObjectTypeProcessor,
};

/** 对象必填字段验证处理器注册条目 */
export const ObjectRequiredFieldsEntry = {
    name: 'object-required-fields',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: ObjectRequiredFieldsProcessor,
};

/** 对象属性验证处理器注册条目 */
export const ObjectPropertiesEntry = {
    name: 'object-properties',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 110,
    execute: ObjectPropertiesProcessor,
};
