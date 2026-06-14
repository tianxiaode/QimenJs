"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamClient = void 0;
const core_1 = require("../core");
const registrars_1 = require("../registrars");
const errors_1 = require("../errors");
const registry_1 = require("@orbitjs/registry");
/**
 * StreamClient 类
 *
 * 专门用于处理流式数据请求，特别是 AI 相关的流式 API
 * 使用 Async Generator 模式，支持 for await 消费
 */
class StreamClient {
    /**
     * 构造函数
     * @param domain 域名，默认为 'default'
     */
    constructor(domain = 'default') {
        this.domain = domain;
    }
    /**
     * 修改后的 chatStream：不再直接 yield，而是返回一个 Task
     *
     * @param url 请求 URL
     * @param body 请求体
     * @param options 请求选项
     * @returns StreamTask 对象，包含异步生成器、取消方法和上下文
     */
    chatStream(url, body, options) {
        var _a;
        // 1. 创建控制器
        const controller = new AbortController();
        const domainName = (_a = this.domain) !== null && _a !== void 0 ? _a : 'default';
        const domainConfig = registry_1.Registry.domain.get(domainName);
        // 2. 创建上下文，并将 signal 注入
        const context = (0, core_1.createFlowContext)('POST', url, domainName, domainConfig, {
            ...options,
            body,
            stream: true,
            signal: controller.signal,
        });
        // 3. 定义内部生成器函数
        const generate = async function* () {
            // --- 这一部分就是你刚才写的逻辑 ---
            const allActions = registrars_1.EntityActionRegistrar.getInstance().getPreparePipeline();
            await (0, core_1.runPipeline)(context, allActions);
            const response = await fetch(context.http.url, {
                method: context.http.method,
                headers: context.http.headers,
                body: typeof body === 'string' ? body : JSON.stringify(body),
                signal: context.http.signal, // 这里是关键：fetch 监听 signal
            });
            // ... 同步 Header 逻辑 (与你之前的一致) ...
            const headers = {};
            response.headers.forEach((v, k) => {
                headers[k] = v;
            });
            context.http.responseHeaders = headers;
            if (!response.ok || !response.body) {
                throw new errors_1.StreamError('Stream request failed', errors_1.KernelErrorCode.STREAM_REQUEST_FAILED);
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop() || '';
                    for (const part of parts) {
                        if (part.trim().startsWith('data:')) {
                            const data = part.replace(/^data:\s*/, '').trim();
                            if (data === '[DONE]')
                                return;
                            try {
                                yield JSON.parse(data);
                            }
                            catch (_a) {
                                yield data;
                            }
                        }
                    }
                }
            }
            finally {
                // 物理层断开后释放锁
                reader.releaseLock();
            }
        };
        // 4. 返回包装对象
        return {
            stream: generate(),
            cancel: (reason) => {
                controller.abort(reason || 'manual_stop');
            },
            context: context,
        };
    }
}
exports.StreamClient = StreamClient;
//# sourceMappingURL=StreamClient.js.map