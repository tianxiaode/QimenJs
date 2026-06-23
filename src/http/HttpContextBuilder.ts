/**
 * HTTP 上下文构建器
 * 
 * 用于构建 HttpContext 对象
 * 
 * @module http/HttpContextBuilder
 */

import type { ExecutionStep } from '@orbitjs/context';
import type { 
    HttpContext, 
    HttpRequestOptions 
} from './types/http-context';

/**
 * HTTP 上下文构建器
 * 
 * 使用构建器模式创建 HttpContext 对象
 * 
 * @example
 * ```typescript
 * const context = HttpContextBuilder
 *     .fromOptions({
 *         url: '/api/users',
 *         method: 'GET',
 *         queryParams: { page: 1 }
 *     })
 *     .withMetadata('domain', 'user')
 *     .build();
 * ```
 */
export class HttpContextBuilder {
    private context: Partial<HttpContext>;
    
    private constructor() {
        this.context = {
            isAborted: false,
            steps: [],
            metadata: {},
            error: null,
        };
    }
    
    /**
     * 创建新的构建器实例
     */
    static create(): HttpContextBuilder {
        return new HttpContextBuilder();
    }
    
    /**
     * 从请求选项构建
     * 
     * @param options - HTTP 请求选项
     * @returns 构建器实例
     */
    static fromOptions(options: HttpRequestOptions): HttpContextBuilder {
        const builder = new HttpContextBuilder();
        
        builder.context.request = {
            url: options.url,
            method: options.method,
            headers: options.headers || {},
            body: options.body,
            queryParams: options.queryParams,
            pathParams: options.pathParams || [],
            timeout: options.timeout || 30000,
            responseType: options.responseType || 'json',
            withCredentials: options.withCredentials,
            signal: options.signal,
            onProgress: options.onProgress,
            controller: new AbortController(),
        };
        
        builder.context.response = {
            status: 0,
            isSuccess: false,
            headers: {},
            data: null,
        };
        
        return builder;
    }
    
    /**
     * 设置请求信息
     */
    withRequest(request: Partial<HttpContext['request']>): this {
        if (!this.context.request) {
            this.context.request = {
                url: '',
                method: 'GET',
                headers: {},
                pathParams: [],
                timeout: 30000,
                responseType: 'json',
                controller: new AbortController(),
            };
        }
        Object.assign(this.context.request, request);
        return this;
    }
    
    /**
     * 设置响应信息
     */
    withResponse(response: Partial<HttpContext['response']>): this {
        if (!this.context.response) {
            this.context.response = {
                status: 0,
                isSuccess: false,
                headers: {},
                data: null,
            };
        }
        Object.assign(this.context.response, response);
        return this;
    }
    
    /**
     * 设置错误
     */
    withError(error: any): this {
        this.context.error = error;
        return this;
    }
    
    /**
     * 设置元数据
     */
    withMetadata(key: string, value: any): this {
        if (!this.context.metadata) {
            this.context.metadata = {};
        }
        this.context.metadata[key] = value;
        return this;
    }
    
    /**
     * 批量设置元数据
     */
    withMetadataMap(metadata: Record<string, any>): this {
        if (!this.context.metadata) {
            this.context.metadata = {};
        }
        Object.assign(this.context.metadata, metadata);
        return this;
    }
    
    /**
     * 中止请求
     */
    abort(): this {
        this.context.isAborted = true;
        if (this.context.request?.controller) {
            this.context.request.controller.abort();
        }
        return this;
    }
    
    /**
     * 添加执行步骤
     */
    addStep(step: ExecutionStep): this {
        if (!this.context.steps) {
            this.context.steps = [];
        }
        this.context.steps.push(step);
        return this;
    }
    
    /**
     * 批量添加执行步骤
     */
    addSteps(steps: ExecutionStep[]): this {
        if (!this.context.steps) {
            this.context.steps = [];
        }
        this.context.steps.push(...steps);
        return this;
    }
    
    /**
     * 构建最终上下文
     * 
     * @throws Error 如果上下文不完整
     * @returns 完整的 HttpContext 对象
     */
    build(): HttpContext {
        if (!this.context.request) {
            throw new Error('HttpContext is missing request information');
        }
        
        if (!this.context.response) {
            throw new Error('HttpContext is missing response information');
        }
        
        return this.context as HttpContext;
    }
    
    /**
     * 克隆当前构建器
     */
    clone(): HttpContextBuilder {
        const cloned = new HttpContextBuilder();
        cloned.context = JSON.parse(JSON.stringify(this.context));
        
        // 重新创建 AbortController（不能被序列化）
        if (this.context.request?.controller) {
            cloned.context.request.controller = new AbortController();
        }
        
        return cloned;
    }
}
