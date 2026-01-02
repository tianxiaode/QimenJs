import { RequestOptions } from './request';

/**
 * URL 处理器接口
 * 定义如何处理 URL 的转换和修改
 * @param url - 原始 URL
 * @param options - 请求配置选项
 * @returns 处理后的 URL
 */
export type IUrlProcessor = (url: string, options: RequestOptions) => string;

/**
 * 请求头处理器接口
 * 定义如何处理请求头的转换和修改
 * @param headers - 原始请求头
 * @param url - 请求 URL
 * @param method - HTTP 方法
 * @param options - 请求配置选项
 * @returns 处理后的请求头
 */
export type IHeaderProcessor = (
    headers: Record<string, string>,
    url: string,
    method: string,
    options: RequestOptions
) => Record<string, string>;

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

/**
 * 响应处理流水线节点类型
 * 定义了响应处理器的接口规范
 *
 * @param context - 当前流水线中的响应上下文
 * @param options - 原始请求配置（只读语义，不应被修改）
 * @returns Promise<HttpResponseContext>
 *
 * @remarks
 * - IResponseProcessor 不要求同时处理成功与失败场景
 * - 是否抛错、何时抛错、错误形态如何，完全由实现者决定
 * - HttpClient 不会捕获或包装 rejected 的结果
 * - 返回一个 resolved Promise：表示处理成功，结果将传递给下一个处理器
 * - 返回一个 rejected Promise：表示处理失败，流水线立即中断
 */
export type IResponseProcessor = (context: HttpResponseContext, options: RequestOptions) => Promise<HttpResponseContext>;
