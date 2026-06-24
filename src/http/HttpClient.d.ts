/**
 * HttpClient 类
 *
 * 提供简单的 HTTP 请求接口
 * - 内部构建 RequestContext
 * - 调用 HttpExecutor 执行请求
 * - 保持简单的 API
 */
import { type RequestContext } from '@orbitjs/context';
/**
 * HTTP 请求选项（简化版，用于 HttpClient）
 */
export interface SimpleRequestOptions {
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
     * 超时时间（毫秒）
     */
    timeout?: number;
    /**
     * 进度回调
     */
    onProgress?: (ev: ProgressEvent) => void;
}
/**
 * HTTP 请求任务
 */
export interface SimpleRequestTask {
    /**
     * 请求上下文（Promise）
     */
    context: Promise<RequestContext>;
    /**
     * 取消请求的方法
     */
    cancel: (reason?: string) => void;
}
/**
 * HttpClient 类
 */
export declare class HttpClient {
    private domain;
    private executor;
    /**
     * 构造函数
     *
     * @param domain - 域名
     */
    constructor(domain?: string);
    /**
     * 构建 RequestContext
     */
    private buildContext;
    /**
     * 发送请求
     */
    private request;
    /**
     * GET 请求
     */
    get(url: string, options?: SimpleRequestOptions): SimpleRequestTask;
    /**
     * POST 请求
     */
    post(url: string, body?: any, options?: SimpleRequestOptions): SimpleRequestTask;
    /**
     * PUT 请求
     */
    put(url: string, body?: any, options?: SimpleRequestOptions): SimpleRequestTask;
    /**
     * PATCH 请求
     */
    patch(url: string, body?: any, options?: SimpleRequestOptions): SimpleRequestTask;
    /**
     * DELETE 请求
     */
    delete(url: string, options?: SimpleRequestOptions): SimpleRequestTask;
    /**
     * 上传文件
     *
     * @param url - 请求 URL
     * @param body - 请求体（通常是 FormData）
     * @param onProgress - 进度回调
     * @param options - 其他选项
     */
    upload(url: string, body: any, onProgress: (ev: ProgressEvent) => void, options?: SimpleRequestOptions): SimpleRequestTask;
    /**
     * 下载文件
     *
     * @param url - 请求 URL
     * @param onProgress - 进度回调
     * @param options - 其他选项
     */
    download(url: string, onProgress: (ev: ProgressEvent) => void, options?: SimpleRequestOptions): SimpleRequestTask;
}
//# sourceMappingURL=HttpClient.d.ts.map