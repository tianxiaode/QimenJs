"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringExcludesEntry = exports.StringIncludesEntry = exports.StringLengthEntry = exports.StringTypeEntry = void 0;
const types_1 = require("../../types");
const type_1 = require("./type");
const length_1 = require("./length");
const includes_1 = require("./includes");
const excludes_1 = require("./excludes");
// 注册字符串类型验证处理器
exports.StringTypeEntry = {
    name: 'string-type',
    tags: ['string', 'password', 'split', 'format'],
    weight: types_1.ValidationWeight.IDENTITY,
    offset: 10,
    execute: type_1.StringTypeProcessor,
};
// 注册字符串长度验证处理器
exports.StringLengthEntry = {
    name: 'string-length',
    tags: ['string', 'password', 'split', 'format'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 50,
    execute: length_1.StringLengthProcessor,
};
// 注册字符串包含验证处理器
exports.StringIncludesEntry = {
    name: 'string-includes',
    tags: ['string', 'password', 'format'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: includes_1.StringIncludesProcessor,
};
// 注册字符串排除验证处理器
exports.StringExcludesEntry = {
    name: 'string-excludes',
    tags: ['string', 'password', 'format'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 105,
    execute: excludes_1.StringExcludesProcessor,
};
//# sourceMappingURL=entries.js.map