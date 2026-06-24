"use strict";
/**
 * HttpExecutor 核心类
 *
 * 负责执行 HTTP 请求的核心逻辑
 * - 接收 RequestContext
 * - 处理 domain 配置
 * - 从 HttpActionRegistrar 获取 actions
 * - 执行管道
 * - 返回处理后的上下文
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExecutor = void 0;
const pipeline_1 = require("@orbitjs/pipeline");
const registry_1 = require("@orbitjs/registry");
const HttpActionRegistrar_1 = require("./HttpActionRegistrar");
/**
 * HttpExecutor 核心类
 */
class HttpExecutor {
    /**
     * 处理 domain 配置
     *
     * @param context - 请求上下文
     */
    processDomainConfig(context) {
        var _a;
        const domain = context.identity.domain;
        // 如果 domain 是字符串，从注册表获取配置
        if (typeof domain === 'string') {
            // 尝试从 Registry 获取 domain 配置
            // 如果 Registry 没有 domain 注册表，则跳过
            try {
                const domainConfig = (_a = registry_1.Registry.domain) === null || _a === void 0 ? void 0 : _a.get(domain);
                if (domainConfig) {
                    // 将 domain 配置存储到 context.metadata
                    context.metadata.domainConfig = domainConfig;
                }
            }
            catch (_b) {
                // Registry 没有 domain 注册表，跳过
            }
        }
    }
    /**
     * 获取 actions 列表
     *
     * @returns actions 列表
     */
    getActions() {
        const registrar = HttpActionRegistrar_1.HttpActionRegistrar.getInstance();
        return registrar.getPipeline();
    }
    /**
     * 执行 HTTP 请求
     *
     * @param context - 请求上下文
     * @returns 执行结果
     */
    async execute(context) {
        try {
            // 处理 domain 配置
            this.processDomainConfig(context);
            // 获取 actions
            const actions = this.getActions();
            // 如果有 actions，执行管道
            if (actions.length > 0) {
                // 转换为 pipeline 需要的格式
                const processors = actions.map(action => ({
                    name: action.name,
                    weight: action.category,
                    offset: action.offset,
                    execute: async (ctx) => {
                        await action.handler(ctx);
                    },
                }));
                // 执行管道
                await pipeline_1.pipeline.execute(context, processors);
            }
            return {
                context,
                success: !context.error,
                error: context.error,
            };
        }
        catch (error) {
            // 捕获执行过程中的错误
            context.error = error;
            return {
                context,
                success: false,
                error,
            };
        }
    }
    /**
     * 创建可取消的执行任务
     *
     * @param context - 请求上下文
     * @returns 包含 promise 和 cancel 方法的对象
     */
    createTask(context) {
        const controller = new AbortController();
        // 将 controller 存储到 context.metadata
        context.metadata._httpController = controller;
        const promise = new Promise((resolve) => {
            // 监听取消事件
            controller.signal.addEventListener('abort', () => {
                context.metadata.isAborted = true;
                resolve({
                    context,
                    success: false,
                    error: new Error('Request cancelled'),
                });
            });
            // 执行请求
            this.execute(context).then(resolve);
        });
        return {
            promise,
            cancel: (reason) => {
                controller.abort(reason || 'user_cancelled');
            },
        };
    }
}
exports.HttpExecutor = HttpExecutor;
//# sourceMappingURL=HttpExecutor.js.map