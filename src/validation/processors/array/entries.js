"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayUniqueByProcessorEntry = exports.arrayUniqueProcessorEntry = exports.arrayChildrenProcessorEntry = exports.arrayExcludesProcessorEntry = exports.arrayIncludesProcessorEntry = exports.arrayLengthProcessorEntry = exports.arrayTypeProcessorEntry = void 0;
const types_1 = require("../../types");
const children_1 = require("./children");
const excludes_1 = require("./excludes");
const includes_1 = require("./includes");
const length_1 = require("./length");
const type_1 = require("./type");
const unique_1 = require("./unique");
const uniqueBy_1 = require("./uniqueBy");
exports.arrayTypeProcessorEntry = {
    name: 'array-type',
    tags: ['array'],
    weight: types_1.ValidationWeight.IDENTITY,
    offset: 10,
    execute: type_1.ArrayTypeProcessor,
};
exports.arrayLengthProcessorEntry = {
    name: 'array-length',
    tags: ['array'],
    execute: length_1.ArrayLengthProcessor,
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 50,
};
exports.arrayIncludesProcessorEntry = {
    name: 'array-includes',
    tags: ['array'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: includes_1.ArrayIncludesProcessor,
};
exports.arrayExcludesProcessorEntry = {
    name: 'array-excludes',
    tags: ['array'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 105,
    execute: excludes_1.ArrayExcludesProcessor,
};
exports.arrayChildrenProcessorEntry = {
    name: 'array-children',
    tags: ['array'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 110,
    execute: children_1.ArrayChildrenProcessor,
};
exports.arrayUniqueProcessorEntry = {
    name: 'array-unique',
    tags: ['array'],
    execute: unique_1.ArrayUniqueProcessor,
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 150,
};
exports.arrayUniqueByProcessorEntry = {
    name: 'array-unique-by',
    tags: ['array'],
    execute: uniqueBy_1.ArrayUniqueByProcessor,
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 155,
};
//# sourceMappingURL=entries.js.map