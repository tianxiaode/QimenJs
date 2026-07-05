import { ValidationWeight } from '../../types';
import { ObjectTypeProcessor } from './type';
import { ObjectRequiredFieldsProcessor } from './required-fields';
import { ObjectPropertiesProcessor } from './properties';

// 注册对象类型验证处理器
export const ObjectTypeEntry = {
    name: 'object-type',
    tags: ['object'],
    weight: ValidationWeight.IDENTITY,
    offset: 10,
    execute: ObjectTypeProcessor,
};

// 注册对象必填字段验证处理器
export const ObjectRequiredFieldsEntry = {
    name: 'object-required-fields',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: ObjectRequiredFieldsProcessor,
};

// 注册对象属性验证处理器
export const ObjectPropertiesEntry = {
    name: 'object-properties',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 110,
    execute: ObjectPropertiesProcessor,
};
