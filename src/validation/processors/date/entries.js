"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateExcludesProcessorEntry = exports.dateIncludesProcessorEntry = exports.dateWeekendProcessorEntry = exports.dateIsProcessorEntry = exports.dateTypeProcessorEntry = void 0;
const type_1 = require("./type");
const is_1 = require("./is");
const weekend_1 = require("./weekend");
const includes_1 = require("./includes");
const excludes_1 = require("./excludes");
const types_1 = require("../../types");
exports.dateTypeProcessorEntry = {
    name: 'date.type',
    tags: ['date'],
    weight: types_1.ValidationWeight.IDENTITY,
    offset: 10,
    execute: type_1.DateTypeProcessor,
};
exports.dateIsProcessorEntry = {
    name: 'date-is',
    tags: ['date'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: is_1.DateIsProcessor,
};
exports.dateWeekendProcessorEntry = {
    name: 'date.weekend',
    tags: ['date'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 105,
    execute: weekend_1.DateWeenendProcessor,
};
exports.dateIncludesProcessorEntry = {
    name: 'date-includes',
    tags: ['date'],
    weight: types_1.ValidationWeight.RELATION,
    offset: 110,
    execute: includes_1.DateIncludesProcessor,
};
exports.dateExcludesProcessorEntry = {
    name: 'date-excludes',
    tags: ['date'],
    weight: types_1.ValidationWeight.RELATION,
    offset: 115,
    execute: excludes_1.DateExcludesProcessor,
};
//# sourceMappingURL=entries.js.map