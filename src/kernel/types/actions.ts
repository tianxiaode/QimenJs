import { BaseExchange, DomainConfig } from '@orbitjs/registry';
import { ActionCategory, ENTITY_ACTION } from './base'; // 或根据你实际路径
import { HttpResponseType } from './http';

export type ActionHandler = (ctx: FlowContext) => Promise<void>;

/**
 * 处理器条目：包含逻辑和优先级
 */
export interface EntityAction {
    name: string;
    category: ActionCategory; // 明确它的功能属性
    description: string; // 给人类看的：说明具体业务意图

    isHttp?: boolean; // 场景开关

    offset: number; // 同层内的细微排序

    domain?: string; // 业务域
    action?: string; // 动作

    handler: ActionHandler;
}

export interface FlowContext extends BaseExchange {
    // --- 1. 标识 (Identity) ---
    readonly domain: string;
    readonly entityName: string;
    readonly action: ENTITY_ACTION;

    // --- 2. 配置 (Config) ---
    readonly config: DomainConfig;
    readonly entity: EntityAction;

    // --- 3. 数据载体 (Payload) ---
    params: any;
    error: any | null;

    // --- 4. 状态与控制 (Flow Control) ---
    isAborted: boolean;
    // --- 5. 增强元数据 (Metadata) ---
    metadata: {

        // 内容类型判定
        contentType: string;
        isJson: boolean;
        isText: boolean;
        isBlob: boolean;
        action: string;

        isErrorHandled: boolean;
        // 处理状态
        isProcessed?: boolean; // 是否被某个拦截器深度改写过

        [key: string]: any; // 允许自定义 (retryCount, cacheHit 等)
    };
    data: {
        source: any;
        parsed: any;
        raw: any | null; // 后端生数据 (原始结构)

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
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
        rawResponse?: any; // 留给需要读取特殊 Header 的情况
        query?: Record<string, any>;
        body?: any;
        segments: (string | number)[];

        // 核心配置 (来自 HttpOptions)
        timeout: number;
        responseType: HttpResponseType;
        withCredentials?: boolean;
        signal?: AbortSignal;
        onProgress?: (ev: ProgressEvent) => void;

    };
}
