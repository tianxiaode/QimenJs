"use strict";
/**
 * HttpClient 类
 *
 * 提供简单的 HTTP 请求接口
 * - 内部构建 RequestContext
 * - 调用 HttpExecutor 执行请求
 * - 保持简单的 API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const context_1 = require("@orbitjs/context");
const HttpExecutor_1 = require("./HttpExecutor");
/**
 * HttpClient 类
 */
class HttpClient {
    /**
     * 构造函数
     *
     * @param domain - 域名
     */
    constructor(domain = 'default') {
        this.domain = domain;
        this.executor = new HttpExecutor_1.HttpExecutor();
    }
    /**
     * 构建 RequestContext
     */
    buildContext(method, url, options = {}) {
        let builder = context_1.RequestContextBuilder
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
    request(method, url, options = {}) {
        // 构建 RequestContext
        const context = this.buildContext(method, url, options);
        // 创建可取消的任务
        const task = this.executor.createTask(context);
        return {
            context: task.promise.then(result => result.context),
            cancel: task.cancel,
        };
    }
    /**
     * GET 请求
     */
    get(url, options) {
        return this.request('GET', url, options);
    }
    /**
     * POST 请求
     */
    post(url, body, options) {
        return this.request('POST', url, { ...options, body });
    }
    /**
     * PUT 请求
     */
    put(url, body, options) {
        return this.request('PUT', url, { ...options, body });
    }
    /**
     * PATCH 请求
     */
    patch(url, body, options) {
        return this.request('PATCH', url, { ...options, body });
    }
    /**
     * DELETE 请求
     */
    delete(url, options) {
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
    upload(url, body, onProgress, options) {
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
    download(url, onProgress, options) {
        return this.request('GET', url, {
            ...options,
            onProgress,
        });
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=HttpClient.js.map