"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitProcessorEntry = void 0;
const types_1 = require("../../types");
const split_1 = require("./split");
// 注册字符串类型验证处理器
exports.SplitProcessorEntry = {
    name: 'string-split',
    tags: ['split'],
    weight: types_1.ValidationWeight.STRUCTURAL,
    offset: 10,
    execute: split_1.SplitProcessor,
};
//# sourceMappingURL=entries.js.map