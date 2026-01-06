import { ENTITY_ACTION } from './base'; // 或根据你实际路径
import { HttpResponseType } from './http';
import { DomainConfig, EntityEntry } from './registry';

export interface FlowContext<T = any> {
    // --- 1. 标识 (Identity) ---
    readonly domain: string;
    readonly entityName: string;
    readonly action: ENTITY_ACTION;

    // --- 2. 配置 (Config) ---
    readonly config: DomainConfig;
    readonly entity: EntityEntry;

    // --- 3. 数据载体 (Payload) ---
    params: any;
    result: T | null;
    error: any | null;

    // --- 4. 状态与控制 (Flow Control) ---
    isAborted: boolean;
    // --- 5. 增强元数据 (Metadata) ---
    metadata: {
        // 传输层状态
        isTransportFailure: boolean; // 网络不通/断网
        isHttpSuccess: boolean; // 2xx 状态码

        // 内容类型判定
        contentType?: string;
        isJson?: boolean;
        isText?: boolean;
        isBlob?: boolean;

        // 处理状态
        isProcessed?: boolean; // 是否被某个拦截器深度改写过

        [key: string]: any; // 允许自定义 (retryCount, cacheHit 等)
    };
    data: {
        raw: any | null; // 后端生数据 (原始结构)

        // --- 归一化后的数据区域 ---
        list: T[] | null; // 如果是 list/all 操作，数据统一放在这里
        item: T | null; // 如果是 detail/create/update，数据统一放在这里

        // 分页信息（可选，针对 list）
        pagination?: {
            total: number;
            pageSize: number;
            pageIndex: number;
        };

        aligned: T | T[] | null; // 对齐后的对象（不分单数复数）
        final: T | T[] | null; // 最终交付对象
    };

    // --- HTTP 特性 (重点在这里) ---
    http: {
        // 请求控制 (Request)
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers: Record<string, string>;
        query?: Record<string, any>;
        body?: any;
        segments: (string | number)[],

        // 核心配置 (来自 HttpOptions)
        timeout: number;
        responseType: HttpResponseType;
        withCredentials?: boolean;
        signal?: AbortSignal;
        onProgress?: (ev: ProgressEvent) => void;

        // 响应状态 (Response)
        status: number; // HTTP 状态码
        rawResponse?: any; // 原始 Response 对象 (AxiosResponse等)
    };
}
