/**
 * HTTP 上下文类型定义
 * 
 * @module http/types/http-context
 */

import type { BaseContext } from '@orbit-js/context';

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP 响应类型
 */
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';

/**
 * HTTP 请求选项
 */
export interface HttpRequestOptions {
    /**
     * 请求 URL
     */
    url: string;
    
    /**
     * HTTP 方法
     */
    method: HttpMethod;
    
    /**
     * 请求头
     */
    headers?: Record<string, string>;
    
    /**
     * 请求体
     */
    body?: any;
    
    /**
     * 查询参数
     */
    queryParams?: Record<string, any>;
    
    /**
     * 路径参数
     */
    pathParams?: (string | number)[];
    
    /**
     * 超时时间（毫秒）
     */
    timeout?: number;
    
    /**
     * 响应类型
     */
    responseType?: HttpResponseType;
    
    /**
     * 是否携带凭证
     */
    withCredentials?: boolean;
    
    /**
     * 中止信号
     */
    signal?: AbortSignal;
    
    /**
     * 进度回调
     */
    onProgress?: (ev: ProgressEvent) => void;
}

/**
 * HTTP 上下文
 * 
 * 继承自 BaseContext，添加 HTTP 特定字段
 */
export interface HttpContext extends BaseContext {
    /**
     * 请求信息
     */
    request: {
        url: string;
        method: HttpMethod;
        headers: Record<string, string>;
        body?: any;
        queryParams?: Record<string, any>;
        pathParams: (string | number)[];
        timeout: number;
        responseType: HttpResponseType;
        withCredentials?: boolean;
        signal?: AbortSignal;
        onProgress?: (ev: ProgressEvent) => void;
        controller: AbortController;
    };
    
    /**
     * 响应信息
     */
    response: {
        status: number;
        isSuccess: boolean;
        headers: Record<string, string>;
        rawResponse?: any;
        data: any;
    };
    
    /**
     * 错误信息
     */
    error: any | null;
}

/**
 * HTTP 请求任务
 */
export interface HttpRequestTask {
    /**
     * 管线执行结果
     */
    context: Promise<HttpContext>;
    
    /**
     * 取消请求的方法
     */
    cancel: (reason?: string) => void;
}

/**
 * 重试选项
 */
export interface HttpRetryOptions {
    /**
     * 最大重试次数
     */
    maxRetries: number;
    
    /**
     * 重试延迟时间（毫秒）
     */
    delay?: number;
    
    /**
     * 判断是否需要重试
     */
    shouldRetry: (context: HttpContext) => boolean;
}
