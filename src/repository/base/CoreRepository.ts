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
    FlowContext,
    PipelineTask,
} from '../types';
import { RepositoryAccessDeniedError } from '../errors';
import { defaultCacheManager, RepositoryCacheManager } from './CacheManager';

// 假设你已有的 Mixin 工具
const BaseWithEvents = composeMixins(Object as any, [WithEvents]);

export abstract class CoreRepository extends (BaseWithEvents as any) {
    protected rowKey: string = 'id'; // 默认前端/数据库主键
    protected basePath: string = ''; // 默认 API 路径前缀
    protected logger: ILogger;
    protected activeTasks = new Map<REPO_ACTION, RequestTask<any>>();
    protected localPrePipelines: PreProcessorPipelines = {};
    protected localDataPipelines: DataProcessorPipelines = {};
    protected enableCache: boolean = false;
    protected cacheManager: RepositoryCacheManager = defaultCacheManager;
    protected cacheTTL?: number;

    constructor(protected config: RepositoryConfig) {
        super();
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 核心调度器：定义请求的生命周期骨架
     */
    protected async sendRequest(action: REPO_ACTION, payload: any): Promise<DataProcessContext> {
        const flow: FlowContext = { action, payload };
        const tasks = this.createPipeline(flow);

        try {
            for (const task of tasks) {
                if (await task.when(flow)) {
                    await task.run(flow);
                }
            }

            if (!flow.result) throw new Error('PIPELINE_STUCK');

            this.emit(`${action}:success`, flow.result);
            return flow.result;
        } catch (err) {
            this.emit(`${action}:error`, err);
            throw err;
        } finally {
            this.emit(`${action}:loading`, false);
            this.activeTasks.delete(action);
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
        reqCtx?: PreRequestContext
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

    /**
     * 专门处理中断/熔断的复用逻辑
     */
    protected createAbortedContext(action: REPO_ACTION, reason: string): DataProcessContext {
        return this.createDataProcessContext(
            {
                isBusinessSuccess: false,
                isAborted: true, // 标记为主动中断
                code: 499, // 或者是你自定义的拦截代码
                message: reason,
            },
            // 如果此时还没生成真正的 reqCtx，可以传一个最小化的模拟对象
            { method: 'GET', url: '', options: {}, action, payload: {} } as any
        );
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

    private async execAccess(f: FlowContext) {
        await this.checkAccess(f.action, f.payload);
    }

    private async execCacheRead(f: FlowContext) {
        f.result = await this.cacheManager.get(this.constructor.name, f.action, f.payload);
    }

    private async execNetwork(f: FlowContext) {
        this.emit(`${f.action}:loading`, true);

        // 1. 竞态处理
        if (this.activeTasks.has(f.action)) this.cancelAction(f.action);

        // 2. 获取预处理上下文
        const preCtx = await this.runPrePipeline(f.action, f.payload);

        // --- 类型守卫：解决 ts(2322) ---
        if (!preCtx) {
            // 如果预处理返回 null，说明流水线被拦截了（比如表单校验未通过）
            // 我们给 result 赋一个中断状态，这样后续的“网络请求”就不会发生了
            f.result = this.createAbortedContext(f.action, 'PRE_PROCESSOR_CANCEL');
            return;
        }

        // 此时 TypeScript 知道 preCtx 绝对不是 null
        f.preCtx = preCtx;

        try {
            this.logger.debug(`⏳ Sending Request: [${f.action}]`, {
                preCtx: preCtx,
            });
            
            const task = this.config.httpClient.request(
                f.preCtx.method,
                f.preCtx.url,
                f.preCtx.options
            );
            this.activeTasks.set(f.action, task);

            f.httpRes = await task.promise;
            f.result = await this.runDataPipeline(f.httpRes, f.preCtx);
        } finally {
            this.activeTasks.delete(f.action);
        }
    }

    private async execCacheMaintain(f: FlowContext) {
        if (!f.result?.status.isBusinessSuccess) return;

        if (['create', 'update', 'delete'].includes(f.action)) {
            await this.cacheManager.clear(this.constructor.name);
        }
        if (['list', 'detail', 'all'].includes(f.action) && f.result) {
            await this.cacheManager.set(
                this.constructor.name,
                f.action,
                f.payload,
                f.result,
                this.cacheTTL
            );
        }
    }

    private createPipeline(flow: FlowContext): PipelineTask[] {
        return [
            {
                name: 'Access',
                when: () => true,
                run: this.execAccess.bind(this),
            },
            {
                name: 'CacheRead',
                when: () => this.enableCache && ['list', 'detail', 'all'].includes(flow.action),
                run: this.execCacheRead.bind(this),
            },
            {
                name: 'Network',
                when: () => !flow.result,
                run: this.execNetwork.bind(this),
            },
            {
                name: 'CacheSave',
                when: () => this.enableCache && !!flow.result,
                run: this.execCacheMaintain.bind(this),
            },
            // 【插拔示例】以后想加埋点？
            // { name: 'Analytics', when: () => true, run: this.execAnalytics.bind(this) }
        ];
    }

    /**
     * 手动清理缓存的方法 (供外部或子类调用)
     */
    public clearCache(): void {
        this.cacheManager.clear(this.constructor.name);
    }
}
