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
} from '../types';
import { EnvType, SystemRegistrar } from '@orbitjs/registry';
import { Ability, ComposableBase } from '../composable';

@Ability(EventAbilityName)
export abstract class CoreEntityManager extends ComposableBase implements ICoreEntityManager {
    domain: string = 'default';
    abstract entityName: string;
    abstract customActions: ActionEntry[];
    abstract preset: string;
    abstract schema: any;
    abstract url: string;
    env: EnvType;

    // 存储当前正在进行的任务：Action -> AbortController
    protected activeTasks = new Map<ENTITY_ACTION, AbortController>();

    constructor() {
        super();
        this.env = SystemRegistrar.getInstance().get('env') || 'production';
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
        const context = createFlowContext('GET', this.url, this.domain, this.entityName, action, {
            ...options,
            signal: controller.signal,
        });

        // 3. 定义异步执行体
        const execute = async (): Promise<FlowContext> => {
            const startTime = Date.now();
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${this.entityName}]`);
                const BaseActions = EntityActionRegistrar.getInstance().getPipeline();
                const allActions = [...BaseActions, ...this.customActions];
                await runPipeline(context, allActions);
                if (context.metadata.hasError) {
                    this.logger.error(`Action [${action}] failed:`, context.metadata.error);
                } else {
                    const duration = Date.now() - startTime;
                    this.logger.debug(`Action [${action}] completed in ${duration}ms`);
                }
                return context;
            } catch (e) {
                // 这里的 catch 捕获的是管道崩溃（代码 Bug）
                this.logger.error(`Pipeline Crash in Action [${action}]!`, e);
                throw e;
            } finally {
                // 清理任务引用
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
        (this as any).customActions = [];

        this.logger.debug(`CoreEntityManager [${this.entityName}] disposed.`);
    }
}
