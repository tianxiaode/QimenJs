"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberExcludesEntry = exports.NumberIncludesEntry = exports.NumberIsEntry = exports.NumberRangeEntry = exports.NumberTypeEntry = void 0;
const types_1 = require("../../types");
const type_1 = require("./type");
const range_1 = require("./range");
const is_1 = require("./is");
const includes_1 = require("./includes");
const excludes_1 = require("./excludes");
// 注册数字类型验证处理器
exports.NumberTypeEntry = {
    name: 'number-type',
    tags: ['number'],
    weight: types_1.ValidationWeight.IDENTITY,
    offset: 10,
    execute: type_1.NumberTypeProcessor,
};
// 注册数字范围验证处理器
exports.NumberRangeEntry = {
    name: 'number-range',
    tags: ['number'],
    weight: types_1.ValidationWeight.QUANTITY,
    offset: 50,
    execute: range_1.NumberRangeProcessor,
};
// 注册数字语义验证处理器
exports.NumberIsEntry = {
    name: 'number.is',
    tags: ['number'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: is_1.NumberIsProcessor,
};
// 注册数字包含验证处理器
exports.NumberIncludesEntry = {
    name: 'number-includes',
    tags: ['number'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 110,
    execute: includes_1.NumberIncludesProcessor,
};
// 注册数字排除验证处理器
exports.NumberExcludesEntry = {
    name: 'number-excludes',
    tags: ['number'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 115,
    execute: excludes_1.NumberExcludesProcessor,
};
//# sourceMappingURL=entries.js.map