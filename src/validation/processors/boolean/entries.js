"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanTypeProcessorEntry = void 0;
const types_1 = require("../../types");
const type_1 = require("./type");
exports.booleanTypeProcessorEntry = {
    name: 'boolean-type',
    tags: ['boolean'],
    weight: types_1.ValidationWeight.IDENTITY,
    offset: 10,
    execute: type_1.BooleanypeProcessor,
};
//# sourceMappingURL=entries.js.map