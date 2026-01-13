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