"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const core_1 = require("../core");
const registrars_1 = require("../registrars");
const registry_1 = require("@orbitjs/registry");
/**
 * HttpClient 类
 *
 * 提供统一的 HTTP 请求接口，支持多种 HTTP 方法和进度监控
 * 通过管道机制处理请求，支持取消操作和进度回调
 */
class HttpClient {
    /**
     * 构造函数
     * @param domain 域名，默认为 'default'
     */
    constructor(domain = 'default') {
        this.domain = domain;
    }
    /**
     * 发送统一请求
     * @param method HTTP 方法 (GET, POST, PUT, etc.)
     * @param url 请求 URL
     * @param options 请求参数 (method, segments, params, data, headers, etc.)
     * @returns RequestTask 对象，包含上下文和取消方法
     */
    request(method, url, options = {}) {
        var _a, _b;
        // 1. 在管线启动前，先拿到控制权
        const controller = new AbortController();
        // 2. 将信号注入 options，确保 createFlowContext 能拿到它
        const context = (0, core_1.createFlowContext)(method, url, (_a = this.domain) !== null && _a !== void 0 ? _a : 'default', registry_1.Registry.domain.get((_b = this.domain) !== null && _b !== void 0 ? _b : 'default'), {
            ...options,
            signal: controller.signal, // 将中止信号传入上下文
        });
        // 3. 启动异步管线
        const pipelinePromise = (async () => {
            const pipeline = registrars_1.EntityActionRegistrar.getInstance().getHttpPipeline();
            // 在 Transport 处理器（Fetch/XHR）中，它们会监听 context.http.signal
            return await (0, core_1.runPipeline)(context, pipeline);
        })();
        // 4. 返回 RequestTask 对象
        return {
            context: pipelinePromise,
            // 取消按钮
            cancel: (reason) => {
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
    get(url, options) {
        return this.request('GET', url, options || {});
    }
    /**
     * POST 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    post(url, body, options) {
        return this.request('POST', url, { ...options, body });
    }
    /**
     * PUT 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    put(url, body, options) {
        return this.request('PUT', url, { ...options, body });
    }
    /**
     * PATCH 请求方法
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    patch(url, body, options) {
        return this.request('PATCH', url, { ...options, body });
    }
    /**
     * DELETE 请求方法
     * @param url 请求 URL
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    delete(url, options) {
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
    upload(url, body, onProgress, options) {
        return this.request('POST', url, { ...options, body, onProgress, isUpload: true });
    }
    /**
     * 下载文件方法
     * @param url 请求 URL
     * @param onProgress 进度回调
     * @param options 请求选项
     * @returns RequestTask 对象
     */
    download(url, onProgress, options) {
        return this.request('GET', url, { ...options, onProgress, isDownload: true });
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=HttpClient.js.map