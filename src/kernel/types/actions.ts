import { DomainConfig } from '@orbitjs/registry';
import { ActionCategory, ENTITY_ACTION } from './base'; // 或根据你实际路径
import { HttpMethod, HttpResponseType } from './http';


export type ActionHandler = (ctx: FlowContext) => Promise<void>;

export interface ExecutionStep {
    name: string; // 处理器名称
    duration: number;  // 执行耗时 (ms)
    status: string; // 状态：success | error | skipped | pending
}


export interface FlowContext {
    // --- 1. 标识 (Identity) ---
    readonly domain: string;
    readonly entityName: string;
    readonly action: ENTITY_ACTION;

    // --- 2. 配置 (Config) ---
    config: DomainConfig;

    // --- 3. 数据载体 (Payload) ---
    params: any;
    error: any | null;

    // --- 4. 状态与控制 (Flow Control) ---
    isAborted: boolean;
    // --- 5. 增强元数据 (Metadata) ---
    metadata: {
        isTransportFailure: boolean;
        hasError: boolean;
        // 内容类型判定
        contentType: string;
        isJson: boolean;
        isText: boolean;
        isBlob: boolean;
        action: string;
        isUpload: boolean;
        isDownload:boolean;

        isErrorHandled: boolean;
        // 处理状态
        isProcessed?: boolean; // 是否被某个拦截器深度改写过

        fileName?: string; // 文件名
        isDownloadHandled?: boolean; // 是否被某个拦截器深度改写过
        

        [key: string]: any; // 允许自定义 (retryCount, cacheHit 等)
    };
    data: {
        source: any;
        parsed: any;
        raw: any | null; // 后端生数据 (原始结构)
        list: any[];       // 对齐后的列表
        item: any;         // 对齐后的单体
        total: number;

        // 分页信息（可选，针对 list）
        pagination?: {
            isRequestAligned: boolean; // 是否与请求参数对齐
            isResponseAligned: boolean; // 是否与响应数据对齐
            total: number;
            pageSize: number;
            pageIndex: number;
        };

    };

    // --- HTTP 特性 (重点在这里) ---
    http: {
        url: string;
        status: number; // 状态码
        isSuccess: boolean; // 是否 2xx
        headers: Record<string, string>;
        method: HttpMethod;
        rawResponse?: any; // 留给需要读取特殊 Header 的情况
        queryParams?: Record<string, any>;
        body?: any;
        pathParams: (string | number)[];

        // 核心配置 (来自 HttpOptions)
        timeout: number;
        responseType: HttpResponseType;
        withCredentials?: boolean;
        signal?: AbortSignal;
        onProgress?: (ev: ProgressEvent) => void;
        controller: AbortController;
        responseHeaders: Record<string, string>;

    };

     steps: ExecutionStep[]; 
}


export interface RequestTask {
    /** 原始的管线执行结果 */
    context: Promise<FlowContext>;
    /** 取消请求的方法 */
    cancel: (reason?: string) => void;
}

export interface EntityRequestTask {
    /** 真正的执行过程 */
    context: Promise<FlowContext>;
    /** 手动取消当前这一个任务 */
    cancel: (reason?: string) => void;
}

export interface StreamTask<T> {
    /** 异步迭代器，用于 for await */
    stream: AsyncIterableIterator<T>;
    /** 取消流传输 */
    cancel: (reason?: string) => void;
    /** 获取当前的上下文（查看 header 等） */
    context: FlowContext;
}

export interface RetryOptions {
    /**
     * 最大重试次数
     */
    maxRetries: number;       
    /**
     * 重试延迟时间（毫秒），默认情况下使用固定延迟
     */
    delay?: number;           
    /**
     * 判断函数：由外部决定什么样的响应上下文需要重试
     * 例如：context.status === -1 (网络丢包) 或 context.status === 429 (限流)
     * @param context - HTTP 响应上下文
     * @returns 是否需要重试
     */
    shouldRetry: (context: FlowContext) => boolean;
}