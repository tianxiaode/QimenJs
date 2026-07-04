/**
 * 请求上下文构建器
 * 
 * 用于构建 RequestContext 对象
 * 主要在实体管理中使用，将实体动作转换为请求上下文
 * 
 * @module context/RequestContextBuilder
 */

import type { 
    RequestContext, 
    ExecutionStep,
    HttpMethod,
    HttpResponseType 
} from './types/request-context';
import { Registry } from '@orbit-js/registry';

/**
 * 请求上下文构建器
 * 
 * 使用构建器模式创建 RequestContext 对象
 * 
 * @example
 * ```typescript
 * // 实体管理中使用
 * const context = RequestContextBuilder
 *     .create()
 *     .withIdentity({ domain: 'user', entityName: 'User', action: 'list' })
 *     .withParams({ page: 1, size: 10 })
 *     .withRequest({
 *         url: '/api/users',
 *         method: 'GET'
 *     })
 *     .build();
 * ```
 */
export class RequestContextBuilder {
    private context: Partial<RequestContext>;
    
    private constructor() {
        this.context = {
            identity: { domain: '' },
            request: {
                url: '',
                method: 'GET',
                headers: {},
                pathParams: [],
                timeout: 30000,
                responseType: 'json',
                controller: new AbortController(),
            },
            response: {
                status: 0,
                isSuccess: false,
                headers: {},
                data: null,
            },
            data: {
                params: null,
                source: null,
                parsed: null,
                raw: null,
                list: [],
                item: null,
                total: 0,
            },
            isAborted: false,
            error: null,
            steps: [],
            metadata: {
                isTransportFailure: false,
                hasError: false,
                contentType: '',
                isJson: false,
                isText: false,
                isBlob: false,
                action: '',
                isUpload: false,
                isDownload: false,
                isErrorHandled: false,
            },
        };
    }
    
    /**
     * 创建新的构建器实例
     */
    static create(): RequestContextBuilder {
        return new RequestContextBuilder();
    }
    
    /**
     * 设置标识信息
     */
    withIdentity(identity: Partial<RequestContext['identity']>): this {
        Object.assign(this.context.identity!, identity);
        return this;
    }
    
    /**
     * 设置域
     */
    withDomain(domain: string): this {
        this.context.identity!.domain = domain;
        return this;
    }
    
    /**
     * 设置实体名称
     */
    withEntityName(entityName: string): this {
        this.context.identity!.entityName = entityName;
        return this;
    }
    
    /**
     * 设置动作
     */
    withAction(action: string): this {
        this.context.identity!.action = action;
        this.context.metadata!.action = action;
        return this;
    }
    
    /**
     * 设置请求信息
     */
    withRequest(request: Partial<RequestContext['request']>): this {
        // 过滤 undefined 值，避免覆盖构造函数中的默认值
        const filtered = Object.entries(request).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
        Object.assign(this.context.request!, filtered);
        return this;
    }
    
    /**
     * 设置 URL
     */
    withUrl(url: string): this {
        this.context.request!.url = url;
        return this;
    }
    
    /**
     * 设置 HTTP 方法
     */
    withMethod(method: HttpMethod): this {
        this.context.request!.method = method;
        return this;
    }
    
    /**
     * 设置请求头
     */
    withHeaders(headers: Record<string, string>): this {
        this.context.request!.headers = headers;
        return this;
    }
    
    /**
     * 设置请求体
     */
    withBody(body: any): this {
        this.context.request!.body = body;
        return this;
    }
    
    /**
     * 设置查询参数
     */
    withQueryParams(queryParams: Record<string, any>): this {
        this.context.request!.queryParams = queryParams;
        return this;
    }
    
    /**
     * 设置响应信息
     */
    withResponse(response: Partial<RequestContext['response']>): this {
        const filtered = Object.entries(response).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
        Object.assign(this.context.response!, filtered);
        return this;
    }
    
    /**
     * 设置数据载体
     */
    withData(data: Partial<RequestContext['data']>): this {
        const filtered = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
        Object.assign(this.context.data!, filtered);
        return this;
    }
    
    /**
     * 设置请求参数
     */
    withParams(params: any): this {
        this.context.data!.params = params;
        return this;
    }
    
    /**
     * 设置错误
     */
    withError(error: any): this {
        this.context.error = error;
        this.context.metadata!.hasError = true;
        return this;
    }
    
    /**
     * 设置元数据
     */
    withMetadata(key: string, value: any): this {
        this.context.metadata![key] = value;
        return this;
    }
    
    /**
     * 批量设置元数据
     */
    withMetadataMap(metadata: Partial<RequestContext['metadata']>): this {
        Object.assign(this.context.metadata!, metadata);
        return this;
    }
    
    /**
     * 设置 Schema
     */
    withSchema(schema: any): this {
        this.context.schema = schema;
        return this;
    }
    
    /**
     * 中止请求
     */
    abort(): this {
        this.context.isAborted = true;
        this.context.request?.controller.abort();
        return this;
    }
    
    /**
     * 添加执行步骤
     */
    addStep(step: ExecutionStep): this {
        this.context.steps!.push(step);
        return this;
    }
    
    /**
     * 批量添加执行步骤
     */
    addSteps(steps: ExecutionStep[]): this {
        this.context.steps!.push(...steps);
        return this;
    }
    
    /**
     * 设置对齐方法
     */
    withAlignToFrontend(alignToFrontend: (target: any) => any): this {
        this.context.alignToFrontend = alignToFrontend;
        return this;
    }
    
    /**
     * 构建最终上下文
     * 
     * @throws Error 如果上下文不完整
     * @returns 完整的 RequestContext 对象
     */
    build(): RequestContext {
        if (!this.context.identity?.domain) {
            throw new Error('RequestContext is missing domain');
        }
        
        if (!this.context.request?.url) {
            throw new Error('RequestContext is missing URL');
        }
        
        // 获取并缓存 domain 配置
        const domain = this.context.identity.domain;
        if (typeof domain === 'string') {
            try {
                const domainConfig = (Registry as any).domain?.get(domain);
                if (domainConfig) {
                    // 将 domain 配置存储到 metadata，避免后续重复获取
                    this.context.metadata!.domainConfig = domainConfig;
                }
            } catch {
                // Registry 没有 domain 注册表，跳过
            }
        }
        
        return this.context as RequestContext;
    }
    
    /**
     * 克隆当前构建器
     */
    clone(): RequestContextBuilder {
        const cloned = new RequestContextBuilder();
        cloned.context = JSON.parse(JSON.stringify(this.context));
        
        // 重新创建 AbortController（不能被序列化）
        if (this.context.request?.controller) {
            cloned.context.request!.controller = new AbortController();
        }
        
        return cloned;
    }
}
