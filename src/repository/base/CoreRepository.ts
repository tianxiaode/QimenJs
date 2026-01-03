CoreRepository.ts
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
import { RepositoryAccessDeniedError } from '../errors';

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
        try {
            // 1. 权限校验
            await this.checkAccess(action, payload);

            // 2. 预处理流水线
            const preCtx = await this.runPrePipeline(action, payload);
            if (!preCtx) {
                // 用户在 Pre-Processor (如确认框) 中止了操作
                return this.createProcessContext({
                    isAborted: true,
                    code: 'PRE_PROCESSOR_ABORT',
                    message: '操作已中止',
                });
            }

            this.logger.debug(`🚀 Request: [${action}]`, {
                preCtx
            })

            // 3. 物理传输 (此处省略 loading 和任务管理)
            const task = this.config.httpClient.request(preCtx.method, preCtx.url, preCtx.options);
            const httpRes = await task.promise;


            // 4. 数据清洗流水线
            return await this.runDataPipeline(httpRes, preCtx);
        } catch (err: any) {
            // 区分：是物理取消还是真正的错误
            if (err.isCancelled) {
                return this.createProcessContext({
                    isCancelled: true,
                    code: 'HTTP_CANCELLED',
                    message: '请求已取消',
                });
            }

            this.logger.error(`❌ Error: [${action}]`, err);

            // 真正的错误 (500, 403, 业务逻辑错误等)
            this.emit(`${action}:error`, err);
            throw err; // 只有真正的异常才抛出，触发全局错误处理
        }
    }

    protected async checkAccess(action: REPO_ACTION, payload: any): Promise<void> {
        if (this.config.accessController) {
            const hasAccess = await this.config.accessController(this.basePath, action, payload);
            if (!hasAccess) {
                throw new RepositoryAccessDeniedError(this.basePath, action);
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
        overrides: Partial<DataProcessContext['status']> & { message?: string },
        reqCtx: PreRequestContext
    ): DataProcessContext {
        return {
            list: [],
            total: 0,
            detail: null,
            message: overrides.message || '',
            code: overrides.code || 200,
            status: {
                isBusinessSuccess: false,
                isAborted: false,
                isCancelled: false,
                ...overrides,
            },
            raw: null,
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