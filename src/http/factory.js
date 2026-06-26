"use strict";
/**
 * HttpFactory 类
 *
 * HTTP 工厂类，提供创建 HTTP 客户端和相关工具的静态方法
 * 作为 HTTP 功能的统一入口，封装了高级功能如重试、轮询等
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpFactory = void 0;
const HttpClient_1 = require("./HttpClient");
/**
 * HttpFactory 类
 */
class HttpFactory {
    /**
     * 创建具有自动重试功能的 HTTP 请求任务
     *
     * @param method - HTTP 请求方法
     * @param url - 请求 URL
     * @param options - 请求选项（包含重试配置）
     * @param domain - 域名
     * @returns 请求任务
     */
    static createRetryTask(method, url, options = {}, domain = 'default') {
        const { retry, ...requestOptions } = options;
        const controller = new AbortController();
        let retryCount = 0;
        let currentTask = null;
        const client = new HttpClient_1.HttpClient(domain);
        const execute = async () => {
            while (true) {
                // 1. 发起请求
                currentTask = client.request(method, url, requestOptions);
                const context = await currentTask.context;
                // 2. 手动取消请求
                if (context.metadata.isAborted) {
                    return context;
                }
                // 3. 如果没有错误，直接返回
                if (!context.error) {
                    return context;
                }
                // 4. 检查重试条件
                const canRetry = retry &&
                    retryCount < retry.maxRetries &&
                    !context.metadata.isAborted &&
                    (retry.shouldRetry ? retry.shouldRetry(context) : true);
                if (canRetry) {
                    retryCount++;
                    if (retry.delay) {
                        await new Promise(resolve => setTimeout(resolve, retry.delay));
                    }
                    continue;
                }
                // 5. 不满足重试条件，返回结果
                return context;
            }
        };
        return {
            context: execute(),
            cancel: (reason) => {
                controller.abort(reason || 'user_cancelled');
                currentTask === null || currentTask === void 0 ? void 0 : currentTask.cancel(reason);
            },
        };
    }
    /**
     * 创建周期性轮询任务
     *
     * @param method - HTTP 请求方法
     * @param url - 请求 URL
     * @param pollingOptions - 轮询选项
     * @param domain - 域名
     * @param callback - 轮询回调函数
     * @returns 停止轮询的函数
     */
    static createPolling(method, url, pollingOptions = {}, domain = 'default', callback) {
        const { interval = 5000, ...requestOptions } = pollingOptions;
        const client = new HttpClient_1.HttpClient(domain);
        let isStopped = false;
        let timeoutId = null;
        const poll = async () => {
            if (isStopped)
                return;
            try {
                const task = client.request(method, url, requestOptions);
                const context = await task.context;
                if (callback) {
                    callback(context);
                }
            }
            catch (error) {
                console.error('Polling error:', error);
            }
            if (!isStopped) {
                timeoutId = setTimeout(poll, interval);
            }
        };
        // 立即执行第一次
        poll();
        // 返回停止函数
        return () => {
            isStopped = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }
}
exports.HttpFactory = HttpFactory;
//# sourceMappingURL=factory.js.map