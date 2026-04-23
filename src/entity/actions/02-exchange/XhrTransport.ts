/**
 * @file XhrTransport.ts
 * @description 
 * 该文件实现了基于XMLHttpRequest的数据传输处理器，主要用于处理上传和下载任务。
 * 它提供了对进度监控、超时控制、错误处理和响应解析的支持。
 */

import { ActionHandler, FlowContext } from '../../types';

export const XhrTransportHandler: ActionHandler = async (context: FlowContext) => {
    // 1. 自治判定：只有上传任务才由 XHR 处理
    if (!context.metadata.isUpload && !context.metadata.isDownload) return;

    // 2. 初始化中断上下文
    const internalController = new AbortController();
    context.http.controller = internalController;
    const timeout = context.config.timeout || 30000; // 上传通常超时给长一点
    const timeoutId = setTimeout(() => internalController.abort('timeout'), timeout);

    return new Promise<void>(resolve => {
        const xhr = new XMLHttpRequest();
        const { url, method, headers, body } = context.http;

        xhr.open(method, url, true);
        xhr.responseType = 'text'; // 响应通常为 JSON 字符串，留给 03 阶段解析

        // 3. 绑定中断信号
        const onAbort = () => xhr.abort();
        internalController.signal.addEventListener('abort', onAbort);

        // 4. 设置请求头
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

        // 5. 进度监控 (从上下文 metadata 中获取进度回调)
        if (context.metadata.onProgress) {
            xhr.upload.onprogress = context.metadata.onProgress;
        }

        // 6. 响应完成处理
        xhr.onload = () => {
            context.http.status = xhr.status;
            context.http.rawResponse = xhr.response; // 存入字符串
            // 提取响应头
            context.http.responseHeaders = parseXhrHeaders(xhr.getAllResponseHeaders());
            context.metadata.isTransportFailure = false;
            finalize();
        };

        // 7. 错误归因
        const handleError = (reason: string) => {
            context.metadata.isTransportFailure = true;
            context.metadata.hasError = true;
            context.metadata.errorReason = reason;
            finalize();
        };

        xhr.onerror = () => handleError('network_error');
        xhr.onabort = () =>
            handleError(internalController.signal.reason === 'timeout' ? 'timeout' : 'cancelled');

        // 8. 资源清理与释放
        const finalize = () => {
            clearTimeout(timeoutId);
            internalController.signal.removeEventListener('abort', onAbort);
            resolve();
        };

        xhr.send(body as XMLHttpRequestBodyInit);
    });
};

/**
 * 解析响应头
 *
 * 将原生响应头字符串转换为普通对象格式
 *
 * @param headerStr - 原生响应头字符串
 * @returns Record<string, string> - 普通对象格式的 headers
 */
function parseXhrHeaders(headerStr: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!headerStr) return headers;
    headerStr
        .trim()
        .split(/[\r\n]+/)
        .forEach(line => {
            const parts = line.split(': ');
            const key = parts.shift()?.toLowerCase();
            const value = parts.join(': ');
            if (key) headers[key] = value;
        });
    return headers;
}