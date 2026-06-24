"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectPropertiesEntry = exports.ObjectRequiredFieldsEntry = exports.ObjectTypeEntry = void 0;
const types_1 = require("../../types");
const type_1 = require("./type");
const required_fields_1 = require("./required-fields");
const properties_1 = require("./properties");
// 注册对象类型验证处理器
exports.ObjectTypeEntry = {
    name: 'object-type',
    tags: ['object'],
    weight: types_1.ValidationWeight.IDENTITY,
    offset: 10,
    execute: type_1.ObjectTypeProcessor,
};
// 注册对象必填字段验证处理器
exports.ObjectRequiredFieldsEntry = {
    name: 'object-required-fields',
    tags: ['object'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: required_fields_1.ObjectRequiredFieldsProcessor,
};
// 注册对象属性验证处理器
exports.ObjectPropertiesEntry = {
    name: 'object-properties',
    tags: ['object'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 110,
    execute: properties_1.ObjectPropertiesProcessor,
};
//# sourceMappingURL=entries.js.map