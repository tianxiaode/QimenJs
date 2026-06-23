/**
 * HttpClient 类
 * 
 * 提供简单的 HTTP 请求接口
 * - 内部构建 RequestContext
 * - 调用 HttpExecutor 执行请求
 * - 保持简单的 API
 */

import { RequestContextBuilder, type RequestContext } from '@orbitjs/context';
import { HttpExecutor, type HttpProcessor } from './HttpExecutor';
import type { HttpMethod } from './types/http-context';

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
export class HttpClient {
    private domain: string;
    private executor: HttpExecutor;
    private processors?: HttpProcessor[];
    
    /**
     * 构造函数
     * 
     * @param domain - 域名
     * @param processors - 可选的处理器列表
     */
    constructor(domain: string = 'default', processors?: HttpProcessor[]) {
        this.domain = domain;
        this.executor = new HttpExecutor();
        this.processors = processors;
    }
    
    /**
     * 设置处理器列表
     */
    setProcessors(processors: HttpProcessor[]): this {
        this.processors = processors;
        return this;
    }
    
    /**
     * 构建 RequestContext
     */
    private buildContext(
        method: HttpMethod,
        url: string,
        options: SimpleRequestOptions = {}
    ): RequestContext {
        let builder = RequestContextBuilder
            .create()
            .withDomain(this.domain)
            .withUrl(url)
            .withMethod(method);
        
        if (options.headers) {
            builder = builder.withHeaders(options.headers);
        }
        
        if (options.body !== undefined) {
            builder = builder.withBody(options.body);
        }
        
        if (options.queryParams) {
            builder = builder.withQueryParams(options.queryParams);
        }
        
        const context = builder.build();
        
        // 存储额外的选项到 metadata
        if (options.timeout) {
            context.metadata.timeout = options.timeout;
        }
        
        if (options.onProgress) {
            context.metadata.onProgress = options.onProgress;
        }
        
        return context;
    }
    
    /**
     * 发送请求
     */
    private request(
        method: HttpMethod,
        url: string,
        options: SimpleRequestOptions = {}
    ): SimpleRequestTask {
        // 构建 RequestContext
        const context = this.buildContext(method, url, options);
        
        // 创建可取消的任务
        const task = this.executor.createTask(context, this.processors);
        
        return {
            context: task.promise.then(result => result.context),
            cancel: task.cancel,
        };
    }
    
    /**
     * GET 请求
     */
    get(url: string, options?: SimpleRequestOptions): SimpleRequestTask {
        return this.request('GET', url, options);
    }
    
    /**
     * POST 请求
     */
    post(url: string, body?: any, options?: SimpleRequestOptions): SimpleRequestTask {
        return this.request('POST', url, { ...options, body });
    }
    
    /**
     * PUT 请求
     */
    put(url: string, body?: any, options?: SimpleRequestOptions): SimpleRequestTask {
        return this.request('PUT', url, { ...options, body });
    }
    
    /**
     * PATCH 请求
     */
    patch(url: string, body?: any, options?: SimpleRequestOptions): SimpleRequestTask {
        return this.request('PATCH', url, { ...options, body });
    }
    
    /**
     * DELETE 请求
     */
    delete(url: string, options?: SimpleRequestOptions): SimpleRequestTask {
        return this.request('DELETE', url, options);
    }
    
    /**
     * 上传文件
     * 
     * @param url - 请求 URL
     * @param body - 请求体（通常是 FormData）
     * @param onProgress - 进度回调
     * @param options - 其他选项
     */
    upload(
        url: string,
        body: any,
        onProgress: (ev: ProgressEvent) => void,
        options?: SimpleRequestOptions
    ): SimpleRequestTask {
        return this.request('POST', url, {
            ...options,
            body,
            onProgress,
        });
    }
    
    /**
     * 下载文件
     * 
     * @param url - 请求 URL
     * @param onProgress - 进度回调
     * @param options - 其他选项
     */
    download(
        url: string,
        onProgress: (ev: ProgressEvent) => void,
        options?: SimpleRequestOptions
    ): SimpleRequestTask {
        return this.request('GET', url, {
            ...options,
            onProgress,
        });
    }
}
