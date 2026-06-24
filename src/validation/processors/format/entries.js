"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatProcessorEntry = void 0;
const types_1 = require("../../types");
const format_1 = require("./format");
// 注册字符串类型验证处理器
exports.FormatProcessorEntry = {
    name: 'format-type',
    tags: ['format'],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 70,
    execute: format_1.FormatProcessor,
};
//# sourceMappingURL=entries.js.map