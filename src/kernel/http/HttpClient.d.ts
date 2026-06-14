import { DownloadOptions, HttpMethod, NoProgressOptions, RequestOptions, RequestTask, UploadOptions } from '../types';
/**
 * HttpClient 类
 *
 * 提供统一的 HTTP 请求接口，支持多种 HTTP 方法和进度监控
 * 通过管道机制处理请求，支持取消操作和进度回调
 */
export declare class HttpClient {
    protected domain: string;
    /**
     * 构造函数
     * @param domain 域名，默认为 'default'
     */
    constructor(domain?: string);
    /**
     * 发送统一请求
     * @param method HTTP 方法 (GET, POST, PUT, etc.)
     * @param url 请求 URL
     * @param options 请求参数 (method, segments, params, data, headers, etc.)
     * @returns RequestTask 对象，包含上下文和取消方法
     */
    request(method: HttpMethod, url: string, options?: RequestOptions): RequestTask;
    /**
     * GET 请求方法
     * @param url 请求 URL
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    get(url: string, options?: NoProgressOptions): RequestTask;
    /**
     * POST 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    post(url: string, body: any, options?: NoProgressOptions): RequestTask;
    /**
     * PUT 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    put(url: string, body: any, options?: NoProgressOptions): RequestTask;
    /**
     * PATCH 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    patch(url: string, body: any, options?: NoProgressOptions): RequestTask;
    /**
     * DELETE 请求方法
     * @param url 请求 URL
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    delete(url: string, options?: NoProgressOptions): RequestTask;
    /**
     * 上传文件方法
     * @param url 请求 URL
     * @param body 请求体
     * @param onProgress 进度回调
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    upload(url: string, body: any, onProgress: (ev: ProgressEvent) => void, options: UploadOptions): RequestTask;
    /**
     * 下载文件方法
     * @param url 请求 URL
     * @param onProgress 进度回调
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    download(url: string, onProgress: (ev: ProgressEvent) => void, options: DownloadOptions): RequestTask;
}
//# sourceMappingURL=HttpClient.d.ts.map