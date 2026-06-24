"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessorEntry = void 0;
const types_1 = require("../../types");
const file_1 = require("./file");
exports.FileProcessorEntry = {
    name: 'file',
    tags: ['file'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 100,
    execute: file_1.FileProcessor,
};
//# sourceMappingURL=entries.js.map