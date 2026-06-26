"use strict";
/**
 * 请求上下文构建器
 *
 * 用于构建 RequestContext 对象
 * 主要在实体管理中使用，将实体动作转换为请求上下文
 *
 * @module context/RequestContextBuilder
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextBuilder = void 0;
const registry_1 = require("@orbitjs/registry");
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
class RequestContextBuilder {
    constructor() {
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
    static create() {
        return new RequestContextBuilder();
    }
    /**
     * 设置标识信息
     */
    withIdentity(identity) {
        Object.assign(this.context.identity, identity);
        return this;
    }
    /**
     * 设置域
     */
    withDomain(domain) {
        this.context.identity.domain = domain;
        return this;
    }
    /**
     * 设置实体名称
     */
    withEntityName(entityName) {
        this.context.identity.entityName = entityName;
        return this;
    }
    /**
     * 设置动作
     */
    withAction(action) {
        this.context.identity.action = action;
        this.context.metadata.action = action;
        return this;
    }
    /**
     * 设置请求信息
     */
    withRequest(request) {
        Object.assign(this.context.request, request);
        return this;
    }
    /**
     * 设置 URL
     */
    withUrl(url) {
        this.context.request.url = url;
        return this;
    }
    /**
     * 设置 HTTP 方法
     */
    withMethod(method) {
        this.context.request.method = method;
        return this;
    }
    /**
     * 设置请求头
     */
    withHeaders(headers) {
        this.context.request.headers = headers;
        return this;
    }
    /**
     * 设置请求体
     */
    withBody(body) {
        this.context.request.body = body;
        return this;
    }
    /**
     * 设置查询参数
     */
    withQueryParams(queryParams) {
        this.context.request.queryParams = queryParams;
        return this;
    }
    /**
     * 设置响应信息
     */
    withResponse(response) {
        Object.assign(this.context.response, response);
        return this;
    }
    /**
     * 设置数据载体
     */
    withData(data) {
        Object.assign(this.context.data, data);
        return this;
    }
    /**
     * 设置请求参数
     */
    withParams(params) {
        this.context.data.params = params;
        return this;
    }
    /**
     * 设置错误
     */
    withError(error) {
        this.context.error = error;
        this.context.metadata.hasError = true;
        return this;
    }
    /**
     * 设置元数据
     */
    withMetadata(key, value) {
        this.context.metadata[key] = value;
        return this;
    }
    /**
     * 批量设置元数据
     */
    withMetadataMap(metadata) {
        Object.assign(this.context.metadata, metadata);
        return this;
    }
    /**
     * 设置 Schema
     */
    withSchema(schema) {
        this.context.schema = schema;
        return this;
    }
    /**
     * 中止请求
     */
    abort() {
        var _a;
        this.context.isAborted = true;
        (_a = this.context.request) === null || _a === void 0 ? void 0 : _a.controller.abort();
        return this;
    }
    /**
     * 添加执行步骤
     */
    addStep(step) {
        this.context.steps.push(step);
        return this;
    }
    /**
     * 批量添加执行步骤
     */
    addSteps(steps) {
        this.context.steps.push(...steps);
        return this;
    }
    /**
     * 设置对齐方法
     */
    withAlignToFrontend(alignToFrontend) {
        this.context.alignToFrontend = alignToFrontend;
        return this;
    }
    /**
     * 构建最终上下文
     *
     * @throws Error 如果上下文不完整
     * @returns 完整的 RequestContext 对象
     */
    build() {
        var _a, _b, _c;
        if (!((_a = this.context.identity) === null || _a === void 0 ? void 0 : _a.domain)) {
            throw new Error('RequestContext is missing domain');
        }
        if (!((_b = this.context.request) === null || _b === void 0 ? void 0 : _b.url)) {
            throw new Error('RequestContext is missing URL');
        }
        // 获取并缓存 domain 配置
        const domain = this.context.identity.domain;
        if (typeof domain === 'string') {
            try {
                const domainConfig = (_c = registry_1.Registry.domain) === null || _c === void 0 ? void 0 : _c.get(domain);
                if (domainConfig) {
                    // 将 domain 配置存储到 metadata，避免后续重复获取
                    this.context.metadata.domainConfig = domainConfig;
                }
            }
            catch (_d) {
                // Registry 没有 domain 注册表，跳过
            }
        }
        return this.context;
    }
    /**
     * 克隆当前构建器
     */
    clone() {
        var _a;
        const cloned = new RequestContextBuilder();
        cloned.context = JSON.parse(JSON.stringify(this.context));
        // 重新创建 AbortController（不能被序列化）
        if ((_a = this.context.request) === null || _a === void 0 ? void 0 : _a.controller) {
            cloned.context.request.controller = new AbortController();
        }
        return cloned;
    }
}
exports.RequestContextBuilder = RequestContextBuilder;
//# sourceMappingURL=RequestContextBuilder.js.map