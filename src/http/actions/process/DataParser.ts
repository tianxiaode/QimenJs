/**
 * @file DataParser.ts
 * @description 
 * 该文件实现了数据解析处理器，负责将原始响应数据解析为适当的数据格式。
 * 支持JSON、Blob和文本等多种数据类型的解析，并处理可能出现的解析错误。
 */

import type { RequestContext } from '@orbitjs/context';

export const DataParserHandler = async (context: RequestContext) => {
    if (context.metadata.isTransportFailure || !context.http.rawResponse) return;

    try {
        const rawResponse = context.http.rawResponse;

        // 统一处理 Fetch (Response对象) 和 XHR (String/Blob)
        if (context.metadata.isJson) {
            // 如果是 Fetch，调用 .json()；如果是 XHR，直接 JSON.parse
            context.data.raw =
                typeof rawResponse.json === 'function'
                    ? await rawResponse.json()
                    : JSON.parse(rawResponse as string);
        } else if (context.metadata.isBlob) {
            context.data.raw =
                typeof rawResponse.blob === 'function' ? await rawResponse.blob() : rawResponse; // XHR 设置了 responseType 就不需要转
        } else {
            context.data.raw =
                typeof rawResponse.text === 'function' ? await rawResponse.text() : rawResponse;
        }

        // 备份一份到 source
        context.data.source = context.data.raw;
    } catch (e) {
        // 解析失败也是一种逻辑错误
        context.metadata.hasError = true;
        context.metadata.errorReason = 'parse_error';
    }
};