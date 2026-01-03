import { WithEvents } from '@orbitjs/event';
import { composeMixins } from '@orbitjs/utils';
import { ILogger, Logger } from '@orbitjs/logger';
import { HttpResponseContext, RequestTask } from '@orbitjs/http';
import {
    REPO_ACTION,
    RepositoryConfig,
    PreProcessorPipelines,
    DataProcessorPipelines,
    PreRequestContext,
    DataProcessContext,
    PreProcessor,
    DataProcessor,
} from '../types';

// 假设你已有的 Mixin 工具
const BaseWithEvents = composeMixins(Object as any, [WithEvents]);

export abstract class CoreRepository extends (BaseWithEvents as any) {
    protected rowKey: string = 'id'; // 默认前端/数据库主键
    protected basePath: string = ''; // 默认 API 路径前缀
    protected logger: ILogger;
    protected activeTasks = new Map<REPO_ACTION, RequestTask<any>>();
    protected localPrePipelines: PreProcessorPipelines = {};
    protected localDataPipelines: DataProcessorPipelines = {};

    constructor(protected config: RepositoryConfig) {
        super();
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 核心调度器：定义请求的生命周期骨架
     */
    protected async sendRequest(action: REPO_ACTION, payload: any) {
        // 1. 访问控制
        await this.checkAccess(action, payload);

        // 2. 竞态处理
        if (this.activeTasks.has(action)) {
            this.cancelAction(action, 'Racing condition');
        }

        // 3. 预处理 (构建意图)
        let preCtx = await this.runPrePipeline(action, payload);
        if (!preCtx) return null; // 优雅熔断

        this.logger.debug(`⏳ Sending Action: [${action}]`, {
            preCtx,
        });


        // 4. 物理传输
        this.emit(`${action}:loading`, true);
        const task = this.config.httpClient.request(preCtx.method, preCtx.url, preCtx.options);
        this.activeTasks.set(action, task);

        try {
            const httpRes = await task.promise;

            // 5. 数据处理 (洗涤结果)
            const result = await this.runDataPipeline(httpRes, preCtx);

            this.emit(`${action}:success`, result);
            return result;
        } catch (err: any) {
            if (err.isCancelled) return null;
            this.emit(`${action}:error`, err);
            throw err;
        } finally {
            this.activeTasks.delete(action);
            this.emit(`${action}:loading`, false);
        }
    }

    protected async checkAccess(action: REPO_ACTION, payload: any): Promise<void> {
        if (this.config.accessController) {
            const hasAccess = await this.config.accessController(this.basePath, action, payload);
            if (!hasAccess) {
                throw new Error(`PERMISSION_DENIED: ${this.basePath} -> ${action}`);
            }
        }
    }

    protected async runPrePipeline(
        action: REPO_ACTION,
        payload: any
    ): Promise<PreRequestContext | null> {
        let ctx = this.createPreRequestContext(action, payload);
        const pipes = this.getCombinedPrePipelines(action);

        for (const pipe of pipes) {
            const result = await pipe(ctx, payload);
            if (!result) return null; // 处理器返回 null 则中断
            ctx = result;
        }
        return ctx;
    }

    protected async runDataPipeline(
        httpRes: HttpResponseContext,
        reqCtx: PreRequestContext
    ): Promise<DataProcessContext> {
        let dataCtx = this.createDataProcessContext(httpRes, reqCtx);
        const pipes = this.getCombinedDataPipelines(reqCtx.metadata.action);

        for (const pipe of pipes) {
            dataCtx = await pipe(dataCtx, httpRes, reqCtx);
        }
        return dataCtx;
    }

    protected createPreRequestContext(action: REPO_ACTION, payload: any): PreRequestContext {
        return {
            method: 'GET',
            url: this.basePath,
            metadata: {
                basePath: this.basePath,
                rowKey: this.rowKey,
                action,
            },
            options: {
                body: payload,
            },
            payload: this.transformRequestData(payload, action),
        };
    }

    protected createDataProcessContext(
        httpRes: HttpResponseContext,
        reqCtx: PreRequestContext
    ): DataProcessContext {
        return {
            list: [],
            total: 0,
            detail: null,
            code: httpRes.status,
            message: '',
            status: { isBusinessSuccess: true, isAborted: false, action: reqCtx.metadata.action },
            raw: httpRes.data,
        };
    }

    protected getCombinedPrePipelines(action: REPO_ACTION): PreProcessor[] {
        const global = this.config.prePipelines || {};
        const local = this.localPrePipelines;
        return [
            ...(global.common || []),
            ...(local.common || []),
            ...(local[action] || []),
            ...(global[action] || []),
        ];
    }

    protected getCombinedDataPipelines(action: REPO_ACTION): DataProcessor[] {
        const global = this.config.dataPipelines || {};
        const local = this.localDataPipelines;
        return [
            ...(global.common || []),
            ...(local.common || []),
            ...(local[action] || []),
            ...(global[action] || []),
        ];
    }

    /**
     * [生命周期钩子] 转换请求载荷
     * 默认原样返回。子类可覆写此方法统一处理日期、空值等。
     */
    protected transformRequestData(payload: any, action: REPO_ACTION): any {
        return payload;
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
            this.logger.debug(`⏳ Cancelled Action: [${action}]`, {
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
}
