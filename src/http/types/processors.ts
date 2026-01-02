import { RequestOptions } from './request';

// 统一命名后的三个核心处理器
export type IUrlProcessor = (url: string, options: RequestOptions) => string;
export type IHeaderProcessor = (
    headers: Record<string, string>,
    url: string,
    method: string,
    options: RequestOptions
) => Record<string, string>;

/**
 * 流水线中流转的标准响应上下文
 */
export interface HttpResponseContext {
    status: number;                     // HTTP 状态码
    headers: Record<string, string>;    // 响应头
    data: any;                          // 响应体（可能是原始串，也可能是解析后的对象）
    options: RequestOptions;            // 原始请求配置
    
    // 内部元数据（由处理器填充，供后续处理器参考）
    metadata: {
        isTransportFailure: boolean;    // 是否是传输失败（而不是业务失败）
        isHttpSuccess: boolean;         // 是否是 HTTP 成功状态码
        contentType?: string;
        isJson?: boolean;
        isText?: boolean;
        isBlob?: boolean;
        isProcessed?: boolean;          // 是否已经被某个处理器深度处理过
        error?: any;                    // 如果发生错误，存储错误详情

        // 核心：允许任意自定义字段
        // 这让开发者可以添加类似 retryCount, startTime, cacheHit 等字段
        [key: string]: any;        
    };
}

/**
 * 响应处理流水线节点
 *
 * @param data
 *   当前流水线中的数据模型。
 *   初始值通常为 HttpResponse 或 HttpTransportFailure，
 *   后续由前一个处理器决定其形态。
 *
 * @param options
 *   原始请求配置（只读语义，不应被修改）
 *
 * @returns
 * - 返回一个 resolved Promise：表示处理成功，结果将传递给下一个处理器
 * - 返回一个 rejected Promise：表示处理失败，流水线立即中断
 *
 * @remarks
 * - IResponseProcessor 不要求同时处理成功与失败场景
 * - 是否抛错、何时抛错、错误形态如何，完全由实现者决定
 * - HttpClient 不会捕获或包装 rejected 的结果
 */

export type IResponseProcessor = (context: HttpResponseContext, options: RequestOptions) => Promise<HttpResponseContext | any>;
