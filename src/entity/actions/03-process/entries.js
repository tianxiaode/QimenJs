"use strict";
/**
 * @file entries.ts
 * @description
 * 该文件定义了处理阶段(action process)的入口配置，包括响应分析器和数据解析器。
 * 这些入口配置负责分析HTTP响应并将其解析为适当的数据格式。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataParserEntry = exports.ResponseAnalyzerEntry = void 0;
const types_1 = require("../../types");
const DataParser_1 = require("./DataParser");
const ResponseAnalyzer_1 = require("./ResponseAnalyzer");
exports.ResponseAnalyzerEntry = {
    name: 'ResponseAnalyzer',
    category: types_1.ActionCategory.PROCESS, // 2000
    description: 'Analyze the response of the HTTP request',
    offset: 100,
    isHttp: true,
    handler: ResponseAnalyzer_1.ResponseAnalyzerHandler
};
exports.DataParserEntry = {
    name: 'DataParser',
    category: types_1.ActionCategory.PROCESS, // 2000
    description: 'Parse the response data',
    isHttp: true,
    offset: 200,
    handler: DataParser_1.DataParserHandler
};
//# sourceMappingURL=entries.js.map