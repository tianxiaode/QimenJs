/**
 * @file entries.ts
 * @description 
 * 该文件定义了处理阶段(action process)的入口配置，包括响应分析器和数据解析器。
 * 这些入口配置负责分析HTTP响应并将其解析为适当的数据格式。
 */

import { ActionCategory, ActionEntry } from "../../types";
import { DataParserHandler } from "./DataParser";
import { ResponseAnalyzerHandler } from "./ResponseAnalyzer";

export const ResponseAnalyzerEntry: ActionEntry = {
    name: 'ResponseAnalyzer',
    category: ActionCategory.PROCESS, // 2000
    description: 'Analyze the response of the HTTP request',
    offset: 100,
    isHttp: true,
    handler: ResponseAnalyzerHandler
};

export const DataParserEntry: ActionEntry = {
    name: 'DataParser',
    category: ActionCategory.PROCESS, // 2000
    description: 'Parse the response data',
    isHttp: true,
    offset: 200,
    handler: DataParserHandler
};