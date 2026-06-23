/**
 * @file ResponseAnalyzer.ts
 * @description 
 * 该文件实现了响应分析处理器，负责分析HTTP响应的状态和头部信息。
 * 它会识别响应类型（JSON、Blob、文本）、判断是否为下载内容、解析文件名等，
 * 并设置相应的元数据标志供后续处理步骤使用。
 */

import type { RequestContext } from '@orbitjs/context';

export const ResponseAnalyzerHandler = async (context: RequestContext) => {
    // 卫语句：物理层彻底失败则跳过
    if (context.metadata.isTransportFailure || !context.http.rawResponse) return;

    const status = context.http.status || 0;
    const headers = context.http.responseHeaders || {};
    const contentDisposition = headers['content-disposition'] || '';
    const contentType = (headers['content-type'] || '').toLowerCase();

    // 1. 状态判定：初步翻红 hasError
    // 即使是 4xx/5xx，我们也只是标记 hasError，不中断流转，因为 04 阶段还要提取报错信息
    if (status >= 400) {
        context.metadata.hasError = true;
    }

    // 1. 识别是否是下载场景
    // 逻辑：Header 里明确要求下载，或者是常见的二进制流
    context.metadata.isDownload =
        contentDisposition.includes('attachment') ||
        contentType.includes('application/octet-stream');

    if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i);
        if (match && match[1]) {
            context.metadata.fileName = decodeURIComponent(match[1]);
        }
    }
    // 2. 类型识别：为 DataParser 铺路
    context.metadata.isJson = contentType.includes('application/json');
    context.metadata.isBlob =
        contentType.includes('application/octet-stream') || contentType.includes('image/');
    context.metadata.isText = contentType.includes('text/') || contentType.includes('xml');

    // 3. 记录解析建议 (供下一个 Action 使用)
    context.metadata.contentType = contentType;
};