import { WithEvents } from '@orbitjs/event';
import { composeMixins } from '@orbitjs/utils';
import { ILogger, Logger } from '@orbitjs/logger';
import { HttpResponseContext } from '@orbitjs/http';
import {
    REPO_ACTION,
    RepositoryConfig,
    RepositoryRequestContext,
    RequestProcessors,
    RepositoryResponseContext,
    RepositoryResponseProcessor,
    RepositoryResponseProcessors,
} from '../types';
import { DefaultRequestProcessors } from '../processors';
import { RepositoryProcessorNotFoundError } from '../errors';

// 假设你已有的 Mixin 工具
const BaseWithEvents = composeMixins(Object as any, [WithEvents]);

export abstract class CoreRepository extends (BaseWithEvents as any) {
    protected rowKey: string = 'id'; // 默认前端/数据库主键
    protected basePath: string = ''; // 默认 API 路径前缀
    protected logger: ILogger;
    protected localResponseProcessors: RepositoryResponseProcessors = {};
    protected localRequestProcessors: RequestProcessors = {};

    constructor(protected config: RepositoryConfig) {
        super();
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 取消特定的正在进行的动作请求
     * @param action 需要取消的动作名称
     * @param reason 取消的原因（可选，用于日志或错误处理）
     */
    public cancelAction(action: REPO_ACTION, reason?: string): boolean {
        const task = this.activeTasks.get(action);

        if (task) {
            // --- 日志：追踪取消动作 ---
            this.logger.debug(`[Repo:${this.constructor.name}] ⏳ Cancelled Action: [${action}]`, {
                reason: reason || 'Manual cancellation',
                task: task,
            });

            // 1. 执行物理取消
            task.cancel();

            // 2. 清理任务表
            this.activeTasks.delete(action);

            // 3. 广播取消状态
            // 提示：UI 层可以监听 cancel 事件来展示“请求已中止”的提示
            this.emit(`${action}:cancel`, { reason });

            // 4. 强制结束 loading 状态
            this.emit(`${action}:loading`, false);

            return true;
        }

        return false;
    }
    /**
     * 核心分发器
     */
    protected async sendRequest(action: REPO_ACTION, payload: any) {
        if (this.activeTasks.has(action)) {
            this.cancelAction(action, 'Racing condition: new request initiated');
        }

        this.emit(`${action}:loading`, true);

        // 准备意图上下文
        const reqCtx: RepositoryRequestContext = {
            metadata: { action, basePath: '', rowKey: this.rowKey },
            options: {
                body: payload,
            },
        } as any;
        const { method, url, options } = this.prepareRequestConfig(action, payload);

        const task = this.config.httpClient.request(method, url, options);
        this.activeTasks.set(action, task);

        // --- 日志：请求发起 ---
        this.logger.debug(`[${action}] Request Prep:`, {
            ...reqCtx,
        });

        try {
            const httpRes = await task.promise;

            // 【调用解释流水线】
            const result = await this.interpretPipeline(httpRes, reqCtx);

            this.emit(`${action}:success`, result);
            return result;
        } catch (err) {
            this.emit(`${action}:error`, err);
            throw err;
        } finally {
            this.activeTasks.delete(action);
            this.emit(`${action}:loading`, false);
        }
    }
    protected buildRequest(action: REPO_ACTION, payload: any): RepositoryRequestContext {
        // 1. 三方取值 & 深度合并 (优先级：Repo > Domain > System)
        // 这里我们合并的是 Processor 或者是包含 Processor 的配置对象
        const processor =
            this.localRequestProcessors[action] ||
            this.config.requestProcessors?.[action] ||
            DefaultRequestProcessors[action];

        // 2. 初始化标准“集装箱”
        const context: RepositoryRequestContext = {
            method: 'GET', // 默认，具体会在 processor 内部被修正
            url: this.basePath,
            metadata: {
                basePath: this.basePath,
                rowKey: this.rowKey,
                action: action,
            },
            options: { pathParams: [], queryParams: {}, body: undefined },
        };

        // 3. 执行搬运
        if (!processor) {
            throw new RepositoryProcessorNotFoundError(action);
        }

        return processor(context, payload);
    }

    /**
     * 核心逻辑：获取当前 Action 的响应处理器链
     */
    /**
     * 获取最终执行的处理器流水线
     */
    /**
     * 获取最终的流水线（这是开发者可以覆写的“最高权力”钩子）
     */
    protected getResponseProcessors(action: REPO_ACTION): RepositoryResponseProcessor[] {
        const local = this.localResponseProcessors;
        const global = this.config.responseProcessors || {};

        /**
         * 执行链解析：
         * 1. global.common: 负责底线逻辑（如 HTTP 错误拦截、归一化槽位初始化）
         * 2. local.common: 负责业务域逻辑（如 用户头像 URL 拼接）
         * 3. local[action]: 负责该动作的微调（如 list 动作的特殊计算）
         * 4. global[action]: 负责全局性的动作后置钩子（如 统计埋点、审计日志）
         */
        return [
            ...(global.common || []),
            ...(local.common || []),
            ...(local[action] || []),
            ...(global[action] || []),
        ];
    }

    protected async interpretPipeline(
        httpRes: HttpResponseContext,
        reqCtx: RepositoryRequestContext
    ): Promise<RepositoryResponseContext> {
        // 初始化“干净的白板”，即便没有任何处理器，至少结构是标准的
        let repoRes: RepositoryResponseContext = {
            list: [],
            total: 0,
            detail: null,
            code: httpRes.status,
            message: '',
            status: { isBusinessSuccess: true, action: reqCtx.metadata.action },
        };

        const processors = this.getResponseProcessors(reqCtx.metadata.action);

        for (const processor of processors) {
            repoRes = await processor(repoRes, httpRes, reqCtx);
        }

        return repoRes;
    }

    /**
     * [生命周期钩子] 转换请求载荷
     * 默认原样返回。子类可覆写此方法统一处理日期、空值等。
     */
    protected transformRequestData(payload: any, action: REPO_ACTION): any {
        return payload;
    }
}
