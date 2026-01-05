import { RequestOptions } from "./request";

/**
 * 原始响应体类型定义
 * 包含所有可能的响应体类型
 */
export type RawBody = string | Blob | ReadableStream | ArrayBuffer | any | null;

/**
 * HTTP 响应接口
 * 定义了 HTTP 响应的基本结构
 */
export interface IHttpResponse {
    /**
     * HTTP 状态码（只读）
     */
    readonly status: number;
    /**
     * 响应头（只读）
     */
    readonly headers: Record<string, string>;
    /**
     * 原始响应体（只读）
     */
    readonly rawBody: RawBody; // 统一类型
    /**
     * 标识是否为传输失败（只读）
     */
    readonly isTransportFailure: false;
}

/**
 * 传输失败原因枚举
 * 定义了各种传输失败的原因
 */
export enum TransportFailureReason {
    /**
     * 网络错误：断网、DNS 失败等
     */
    NetworkError = 'NETWORK_ERROR',     
    /**
     * 请求被中止：超时或主动取消
     */
    Aborted = 'ABORTED',               
    /**
     * 安全错误：跨域拦截、SSL 证书问题等
     */
    SecurityError = 'SECURITY_ERROR',   
    /**
     * 未知错误
     */
    Unknown = 'UNKNOWN'
}

/**
 * HTTP 传输失败接口
 * 定义了 HTTP 传输失败的信息结构
 */
export interface IHttpTransportFailure {
    /**
     * 错误对象（只读）
     */
    readonly error: any;
    /**
     * 错误消息（只读）
     */
    readonly message: string;
    /**
     * 标识是否为传输失败（只读）
     */
    readonly isTransportFailure: true;
    /**
     * 失败原因（只读）
     */
    readonly reason: string;
}

/**
 * 请求结果类型定义
 * 可能是 HTTP 响应或 HTTP 传输失败
 */
export type RequestResult = IHttpResponse | IHttpTransportFailure;

/**
 * 流水线中流转的标准响应上下文接口
 * 包含响应数据和元数据，用于在处理器之间传递信息
 */
export interface HttpResponseContext {
    /**
     * HTTP 状态码
     */
    status: number;                     
    /**
     * 响应头
     */
    headers: Record<string, string>;    
    /**
     * 响应体（可能是原始串，也可能是解析后的对象）
     */
    data: any;                          
    /**
     * 原始请求配置
     */
    options: RequestOptions;            
    
    /**
     * 内部元数据（由处理器填充，供后续处理器参考）
     */
    metadata: {
        /**
         * 是否是传输失败（而不是业务失败）
         */
        isTransportFailure: boolean;    
        /**
         * 是否是 HTTP 成功状态码
         */
        isHttpSuccess: boolean;         
        /**
         * 内容类型
         */
        contentType?: string;
        /**
         * 是否是 JSON 类型
         */
        isJson?: boolean;
        /**
         * 是否是文本类型
         */
        isText?: boolean;
        /**
         * 是否是 Blob 类型
         */
        isBlob?: boolean;
        /**
         * 是否被中止
         */
        isAborted: boolean;
        /**
         * 是否已经被某个处理器深度处理过
         */
        isProcessed?: boolean;          
        /**
         * 如果发生错误，存储错误详情
         */
        error?: any;                    

        /**
         * 核心：允许任意自定义字段
         * 这让开发者可以添加类似 retryCount, startTime, cacheHit 等字段
         */
        [key: string]: any;        
    };
}
