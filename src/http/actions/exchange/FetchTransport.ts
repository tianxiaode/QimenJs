/**
 * @file FetchTransport.ts
 * @description 
 * 该文件实现了基于Fetch API的数据传输处理器，用于发送HTTP请求和接收响应。
 * 它支持请求超时控制、错误处理和响应数据填充等功能。
 * 注意：仅适用于非上传和下载任务。
 */

import type { RequestContext } from '@qimenjs/context';

export const FetchTransportHandler = async (context: RequestContext) => {
    // 1. 自治判定：非上传任务才走 Fetch
    if (context.metadata.isUpload || context.metadata.isDownload) return;

    // 2. 初始化 Abort 控制器并存入上下文，供外部或后续逻辑控制
    const internalController = new AbortController();
    context.request.controller = internalController; // 重点：控制权外露
    
    // 3. 处理超时逻辑
    const timeout = context.request.timeout || 10000;
    const timeoutId = setTimeout(() => internalController.abort('timeout'), timeout);

    try {
        const { url, method, headers, body } = context.request;

        const response = await fetch(url, {
            method,
            headers,
            // 序列化 body
            body: !['GET', 'HEAD'].includes(method.toUpperCase()) 
                  ? JSON.stringify(body) 
                  : undefined,
            signal: internalController.signal,
        });

        // 4. 填充物理响应信息
        context.response.status = response.status;
        context.response.isSuccess = response.ok;
        context.response.rawResponse = response;
        
        // 5. 提取响应头
        context.response.headers = {};
        response.headers.forEach((v, k) => { context.response.headers[k] = v; });

        context.metadata.isTransportFailure = false;
        
    } catch (error: any) {
        context.metadata.isTransportFailure = true;
        context.error = error;
        
        // 识别是否是超时导致
        if (error.name === 'AbortError' || internalController.signal.aborted) {
            context.metadata.errorReason = internalController.signal.reason === 'timeout' ? 'timeout' : 'cancelled';
        } else {
            context.metadata.errorReason = 'network_error';
        }
    } finally {
        clearTimeout(timeoutId);
    }
};
