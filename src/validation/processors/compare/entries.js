"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const compare_1 = require("./compare");
const CompareProcessorEntry = {
    name: 'compare',
    tags: ['compare'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: compare_1.CompareProcessor,
};
//# sourceMappingURL=entries.js.map