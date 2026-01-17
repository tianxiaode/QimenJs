import {
    DownloadOptions,
    HttpMethod,
    NoProgressOptions,
    RequestOptions,
    RequestTask,
    UploadOptions,
} from '../types';
import { createFlowContext, runPipeline } from '../core';
import { FlowContext } from '../types';
import { EntityActionRegistrar } from '../registrars';
import { DomainRegistrar } from '@orbitjs/registry';

/**
 * HttpClient 类
 * 
 * 提供统一的 HTTP 请求接口，支持多种 HTTP 方法和进度监控
 * 通过管道机制处理请求，支持取消操作和进度回调
 */
export class HttpClient {
    protected domain: string;
    
    /**
     * 构造函数
     * @param domain 域名，默认为 'default'
     */
    constructor(domain: string = 'default') {
        this.domain = domain;
    }

    /**
     * 发送统一请求
     * @param method HTTP 方法 (GET, POST, PUT, etc.)
     * @param url 请求 URL
     * @param options 请求参数 (method, segments, params, data, headers, etc.)
     * @returns RequestTask 对象，包含上下文和取消方法
     */
    public request(method: HttpMethod, url: string, options: RequestOptions = {}): RequestTask {
        // 1. 在管线启动前，先拿到控制权
        const controller = new AbortController();

        // 2. 将信号注入 options，确保 createFlowContext 能拿到它
        const context = createFlowContext(
            method,
            url,
            this.domain ?? 'default',
            DomainRegistrar.getInstance().get(this.domain ?? 'default'),
            {
                ...options,
                signal: controller.signal, // 将中止信号传入上下文
            }
        );

        // 3. 启动异步管线
        const pipelinePromise = (async () => {
            const pipeline = EntityActionRegistrar.getInstance().getHttpPipeline();
            // 在 Transport 处理器（Fetch/XHR）中，它们会监听 context.http.signal
            return await runPipeline(context, pipeline);
        })();

        // 4. 返回 RequestTask 对象
        return {
            context: pipelinePromise as Promise<FlowContext>,
            // 取消按钮
            cancel: (reason?: string) => {
                controller.abort(reason || 'user_cancelled');
            },
        };
    }

    // --- 语义化语法糖 ---

    /**
     * GET 请求方法
     * @param url 请求 URL
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public get(url: string, options?: NoProgressOptions) {
        return this.request('GET', url, options || {});
    }

    /**
     * POST 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public post(url: string, body: any, options?: NoProgressOptions) {
        return this.request('POST', url, { ...options, body });
    }

    /**
     * PUT 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public put(url: string, body: any, options?: NoProgressOptions) {
        return this.request('PUT', url, { ...options, body });
    }

    /**
     * PATCH 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public patch(url: string, body: any, options?: NoProgressOptions) {
        return this.request('PATCH', url, { ...options, body });
    }

    /**
     * DELETE 请求方法
     * @param url 请求 URL
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public delete(url: string, options?: NoProgressOptions) {
        return this.request('DELETE', url, { ...options });
    }

    /**
     * 上传文件方法
     * @param url 请求 URL
     * @param body 请求体
     * @param onProgress 进度回调
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public upload(
        url: string,
        body: any,
        onProgress: (ev: ProgressEvent) => void,
        options: UploadOptions
    ) {
        return this.request('POST', url, { ...options, body, onProgress, isUpload: true });
    }

    /**
     * 下载文件方法
     * @param url 请求 URL
     * @param onProgress 进度回调
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    public download(
        url: string,
        onProgress: (ev: ProgressEvent) => void,
        options: DownloadOptions
    ) {
        return this.request('GET', url, { ...options, onProgress, isDownload: true });
    }
}