import { runPipeline, createFlowContext } from '../core';
import { EntityActionRegistrar } from '../registrars';
import {
    ActionEntry,
    ENTITY_ACTION,
    EntityRequestTask,
    EventAbilityName,
    FlowContext,
    RequestOptions,
    ICoreEntityManager,
    Schema,
    DomainAbilityName,
    SystemAbilityName,
    SechmaAbilityName,
    IEventAbilitiy,
    IDomainAbility,
    ISystemAbility,
    ISchemaAbility,
} from '../types';
import { Ability, ComposableBase } from '../composable';

@Ability(EventAbilityName, DomainAbilityName, SystemAbilityName, SechmaAbilityName)
export abstract class CoreEntityManager extends ComposableBase implements ICoreEntityManager {
    domain: string = 'default';
    abstract customActions: ActionEntry[];
    abstract entityName: string;
    abstract url: string;
    abstract schema?: Schema;

    // 存储当前正在进行的任务：Action -> AbortController
    protected activeTasks = new Map<ENTITY_ACTION, AbortController>();

    constructor() {
        super();
    }

    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask {
        // 1. 自动取消逻辑（逻辑同前）
        if (this.activeTasks.has(action)) {
            this.logger.warn(
                `Action [${action}] is already running. Auto-cancelling previous task.`
            );
            this.activeTasks.get(action)?.abort('auto_cancelled');
        }

        const controller = new AbortController();
        this.activeTasks.set(action, controller);

        // 2. 构建上下文
        const context = createFlowContext(
            'GET',
            this.url,
            this.domain,
            this.getDomainConfig(),
            {
                ...options,
                signal: controller.signal,
            },
            this.entityName,
            action,
            this.getScheme()
        );

        // 3. 定义异步执行体
        const execute = async (): Promise<FlowContext> => {
            const startTime = Date.now();
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${this.entityName}]`);

                // 1. 尝试从类级缓存获取已合并的管道
                const CACHE_KEY = '__ACTION_PIPELINE__';
                let allActions = this.getStatic<any[]>(CACHE_KEY);

                // 2. 如果没有缓存（第一次执行），则进行合并并存入缓存
                if (!allActions) {
                    const baseActions = EntityActionRegistrar.getInstance().getPipeline();
                    // 假设 customActions 是定义在类上的静态属性或通过构造传入的固定列表
                    allActions = [...baseActions, ...(this.customActions || [])];

                    this.setStatic(CACHE_KEY, allActions);
                    this.logger.debug(`Pipeline cached for Entity [${this.entityName}]`);
                }

                // 3. 直接使用缓存的管道执行
                await runPipeline(context, allActions);

                if (context.metadata.hasError) {
                    this.logger.error(`Action [${action}] failed:`, context.metadata.error);
                } else {
                    const duration = Date.now() - startTime;
                    this.logger.debug(`Action [${action}] completed in ${duration}ms`);
                }
                return context;
            } catch (e) {
                this.logger.error(`Pipeline Crash in Action [${action}]!`, e);
                throw e;
            } finally {
                if (this.activeTasks.get(action) === controller) {
                    this.activeTasks.delete(action);
                }
            }
        };

        // 4. 立即返回任务对象，而不是等待请求完成
        return {
            context: execute(),
            cancel: (reason?: string) => controller.abort(reason || 'manual_cancelled'),
        };
    }

    /**
     * 强力工具：取消该实体下所有的在研请求
     */
    cancelAll() {
        this.activeTasks.forEach(c => c.abort('manager_cancel_all'));
        this.activeTasks.clear();
    }

    public dispose(): void {
        // 1. 立即中断所有正在进行的请求任务
        this.cancelAll();

        // 2. 清理 Ability 容器 (由于继承自 ComposableBase，这里可能需要调用父类的清理)
        if (typeof super.dispose === 'function') {
            super.dispose();
        }

        // 3. 释放大对象引用，协助 GC
        this.activeTasks.clear();
        this.schema = undefined;
        this.customActions = [];

        this.logger.debug(`CoreEntityManager [${this.entityName}] disposed.`);
    }
}

export interface CoreEntityManager
    extends IEventAbilitiy, IDomainAbility, ISystemAbility, ISchemaAbility {}