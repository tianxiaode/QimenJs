import { WithEvents } from '@orbitjs/event';
import { composeMixins } from '@orbitjs/utils';
import { ILogger, Logger } from '@orbitjs/logger';
import { RequestTask } from '@orbitjs/http';
import {
    REPO_ACTION,
    RepositoryConfig,
    PreProcessorPipelines,
    DataProcessorPipelines,
    DataProcessContext,
} from '../types';
import { defaultCacheManager, RepositoryCacheManager } from './CacheManager';
import { FlowRunner } from './FlowRunner';

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
        this.logger.debug(`⏳ Sending Request: [${action}]`, { payload });
        
        return await FlowRunner.run(
            {
                repoName: this.constructor.name,
                httpClient: this.config.httpClient,
                activeTasks: this.activeTasks,
                // ... pipelines ...
                basePath: this.basePath,
                rowKey: this.rowKey,
                prePipelines: { global: this.config.prePipelines, local: this.localPrePipelines },
                dataPipelines: {
                    global: this.config.dataPipelines,
                    local: this.localDataPipelines,
                },
                accessController: this.config.accessController,

                // --- 重新接回原有的 3 个核心事件 ---
                onLoading: isLoading => {
                    this.emit(`${action}:loading`, isLoading);
                },
                onSuccess: result => {
                    this.emit(`${action}:success`, result);
                },
                onError: err => {
                    this.emit(`${action}:error`, err);
                },

                transformFn: (p, a) => this.transformRequestData(p, a),
            },
            action,
            payload
        );
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

    /**
     * 手动清理缓存的方法 (供外部或子类调用)
     */
    public clearCache(): void {
        this.cacheManager.clear(this.constructor.name);
    }
}
