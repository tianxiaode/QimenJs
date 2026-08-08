/**
 * 请求上下文类型定义
 *
 * 贯穿整个请求生命周期的上下文对象
 * 包含请求、响应、数据处理等所有信息
 *
 * @module context/types/request-context
 */

import type { ExecutionStep } from '../base';

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP 响应类型
 */
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';

/**
 * 分页信息
 */
export interface PaginationInfo {
    /**
     * 是否与请求参数对齐
     */
    isRequestAligned: boolean;

    /**
     * 是否与响应数据对齐
     */
    isResponseAligned: boolean;

    /**
     * 总数
     */
    total: number;

    /**
     * 每页大小
     */
    pageSize: number;

    /**
     * 当前页索引
     */
    pageIndex: number;
}

/**
 * 请求上下文
 *
 * 贯穿整个请求生命周期的上下文对象
 * 包含请求、响应、数据处理等所有信息
 */
export interface RequestContext {
    // === 标识信息 ===
    /**
     * 标识信息
     */
    identity: {
        /**
         * 域名称
         */
        domain: string;

        /**
         * 实体名称
         */
        entityName?: string;

        /**
         * 动作类型
         */
        action?: string;
    };

    // === 请求信息 ===
    /**
     * 请求信息
     */
    request: {
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
        headers: Record<string, string>;

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
        pathParams: (string | number)[];

        /**
         * 超时时间（毫秒）
         */
        timeout: number;

        /**
         * 响应类型
         */
        responseType: HttpResponseType;

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

        /**
         * 中止控制器
         */
        controller: AbortController;
    };

    // === 响应信息 ===
    /**
     * 响应信息
     */
    response: {
        /**
         * 响应状态码
         */
        status: number;

        /**
         * 是否成功（2xx）
         */
        isSuccess: boolean;

        /**
         * 响应头
         */
        headers: Record<string, string>;

        /**
         * 原始响应对象
         */
        rawResponse?: any;

        /**
         * 响应数据
         */
        data: any;
    };

    // === 数据载体 ===
    /**
     * 数据载体
     */
    data: {
        /**
         * 请求参数
         */
        params: any;

        /**
         * 源数据
         */
        source: any;

        /**
         * 解析后数据
         */
        parsed: any;

        /**
         * 原始数据（后端返回）
         */
        raw: any | null;

        /**
         * 列表数据（对齐后）
         */
        list: any[];

        /**
         * 单项数据（对齐后）
         */
        item: any;

        /**
         * 总数
         */
        total: number;

        /**
         * 分页信息
         */
        pagination?: PaginationInfo;
    };

    // === 状态与控制 ===
    /**
     * 是否已中止
     */
    isAborted: boolean;

    /**
     * 错误信息
     */
    error: any | null;

    /**
     * 执行步骤记录
     */
    steps: ExecutionStep[];

    // === 元数据 ===
    /**
     * 元数据
     */
    metadata: {
        /**
         * 是否传输失败
         */
        isTransportFailure: boolean;

        /**
         * 是否有错误
         */
        hasError: boolean;

        /**
         * 内容类型
         */
        contentType: string;

        /**
         * 是否 JSON
         */
        isJson: boolean;

        /**
         * 是否文本
         */
        isText: boolean;

        /**
         * 是否 Blob
         */
        isBlob: boolean;

        /**
         * 动作名称
         */
        action: string;

        /**
         * 是否上传
         */
        isUpload: boolean;

        /**
         * 是否下载
         */
        isDownload: boolean;

        /**
         * 错误是否已处理
         */
        isErrorHandled: boolean;

        /**
         * 是否已处理
         */
        isProcessed?: boolean;

        /**
         * 文件名
         */
        fileName?: string;

        /**
         * 下载是否已处理
         */
        isDownloadHandled?: boolean;

        /**
         * 允许自定义属性
         */
        [key: string]: any;
    };

    // === Schema ===
    /**
     * Schema 定义
     */
    schema?: any;

    // === 方法 ===
    /**
     * 对齐到前端数据结构
     */
    alignToFrontend(target: any): any;
}

/**
 * 请求任务
 */
export interface RequestTask {
    /**
     * 管线执行结果
     */
    context: Promise<RequestContext>;

    /**
     * 取消请求的方法
     */
    cancel: (reason?: string) => void;
}

/**
 * 重试选项
 */
export interface RetryOptions {
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
    shouldRetry: (context: RequestContext) => boolean;
}
