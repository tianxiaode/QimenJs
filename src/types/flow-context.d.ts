/**
 * 请求上下文类型定义
 *
 * 独立的类型定义，避免循环引用
 *
 * @module types/request-context
 */
import { DomainConfig } from '../registry/types';
/**
 * 执行步骤记录
 */
export interface ExecutionStep {
    /**
     * 处理器名称
     */
    name: string;
    /**
     * 执行耗时（毫秒）
     */
    duration: number;
    /**
     * 执行状态
     */
    status: 'success' | 'error' | 'skipped' | 'pending';
    /**
     * 错误信息（如果有）
     */
    error?: any;
}
/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
/**
 * HTTP 响应类型
 */
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';
/**
 * 实体动作类型
 */
export type ENTITY_ACTION = string;
/**
 * Schema 类型（简化定义）
 */
export type Schema = any;
/**
 * 请求上下文
 *
 * @description 贯穿整个请求生命周期的上下文对象
 * 包含请求、响应、数据处理等所有信息
 */
export interface RequestContext {
    /**
     * 域名称
     */
    readonly domain: string;
    /**
     * 实体名称
     */
    readonly entityName?: string;
    /**
     * 动作类型
     */
    readonly action?: ENTITY_ACTION;
    /**
     * 域配置
     */
    config: DomainConfig;
    /**
     * 请求参数
     */
    params: any;
    /**
     * 错误信息
     */
    error: any | null;
    /**
     * Schema 定义
     */
    schema?: Schema;
    /**
     * 是否已中止
     */
    isAborted: boolean;
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
    /**
     * 数据容器
     */
    data: {
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
        pagination?: {
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
        };
    };
    /**
     * HTTP 相关信息
     */
    http: {
        /**
         * 请求 URL
         */
        url: string;
        /**
         * 响应状态码
         */
        status: number;
        /**
         * 是否成功（2xx）
         */
        isSuccess: boolean;
        /**
         * 请求头
         */
        headers: Record<string, string>;
        /**
         * HTTP 方法
         */
        method: HttpMethod;
        /**
         * 原始响应对象
         */
        rawResponse?: any;
        /**
         * 查询参数
         */
        queryParams?: Record<string, any>;
        /**
         * 请求体
         */
        body?: any;
        /**
         * 路径参数
         */
        pathParams: (string | number)[];
        /**
         * 超时时间
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
        /**
         * 响应头
         */
        responseHeaders: Record<string, string>;
    };
    /**
     * 执行步骤记录
     */
    steps: ExecutionStep[];
    /**
     * 对齐到前端数据结构
     */
    alignToFrontend(target: any): any;
}
/**
 * 兼容性别名（保持向后兼容）
 * @deprecated 请使用 RequestContext
 */
export type FlowContext = RequestContext;
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
 * 实体请求任务
 */
export interface EntityRequestTask {
    /**
     * 执行过程
     */
    context: Promise<RequestContext>;
    /**
     * 取消任务的方法
     */
    cancel: (reason?: string) => void;
}
/**
 * 流式任务
 */
export interface StreamTask<T> {
    /**
     * 异步迭代器
     */
    stream: AsyncIterableIterator<T>;
    /**
     * 取消流传输
     */
    cancel: (reason?: string) => void;
    /**
     * 获取当前上下文
     */
    context: RequestContext;
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
//# sourceMappingURL=flow-context.d.ts.map