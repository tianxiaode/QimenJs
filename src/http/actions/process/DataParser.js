"use strict";
/**
 * @file DataParser.ts
 * @description
 * 该文件实现了数据解析处理器，负责将原始响应数据解析为适当的数据格式。
 * 支持JSON、Blob和文本等多种数据类型的解析，并处理可能出现的解析错误。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataParserHandler = void 0;
const DataParserHandler = async (context) => {
    if (context.metadata.isTransportFailure || !context.response.rawResponse)
        return;
    try {
        const rawResponse = context.response.rawResponse;
        // 统一处理 Fetch (Response对象) 和 XHR (String/Blob)
        if (context.metadata.isJson) {
            // 如果是 Fetch，调用 .json()；如果是 XHR，直接 JSON.parse
            context.data.raw =
                typeof rawResponse.json === 'function'
                    ? await rawResponse.json()
                    : JSON.parse(rawResponse);
        }
        else if (context.metadata.isBlob) {
            context.data.raw =
                typeof rawResponse.blob === 'function' ? await rawResponse.blob() : rawResponse; // XHR 设置了 responseType 就不需要转
        }
        else {
            context.data.raw =
                typeof rawResponse.text === 'function' ? await rawResponse.text() : rawResponse;
        }
        // 将解析后的数据存入 response.data
        context.response.data = context.data.raw;
        // 备份一份到 source
        context.data.source = context.data.raw;
    }
    catch (e) {
        // 解析失败也是一种逻辑错误
        context.error = new Error('parse_error');
        context.metadata.errorReason = 'parse_error';
    }
};
exports.DataParserHandler = DataParserHandler;
//# sourceMappingURL=DataParser.js.map