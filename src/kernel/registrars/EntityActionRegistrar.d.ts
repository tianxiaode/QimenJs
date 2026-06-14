import { RegistrarBase } from '@/registry';
import { ActionEntry } from '../types';
/**
 * EntityActionRegistrar 名称常量
 */
export declare const EntityActionRegistrarName = "action";
/**
 * EntityActionRegistrar 类用于管理实体动作的注册和检索
 * 支持不同类型的处理器，并提供缓存机制来优化性能
 *
 * 主要功能：
 * - 注册和管理各种动作处理器
 * - 按类别（PREPARE, EXCHANGE, PROCESS, ALIGN）组织处理器
 * - 提供多种管道访问方式（HTTP管道、准备管道等）
 * - 通过缓存机制优化性能
 */
export declare class EntityActionRegistrar extends RegistrarBase<Map<string, ActionEntry>> {
    readonly name = "action";
    /**
     * 存储所有已注册的动作处理器
     * key: 动作名称
     * value: ActionEntry对象
     */
    protected storage: Map<string, ActionEntry>;
    /**
     * HTTP管道缓存，存储所有isHttp为true的动作
     */
    private httpPipelineCache;
    /**
     * 域动作管道缓存，按域分组存储动作
     */
    private domainActionPipelineCache;
    /**
     * 注册一个处理器
     * @param action 包含动作名称、类别、描述、处理器函数等信息的ActionEntry对象
     */
    register(action: ActionEntry): void;
    /**
     * 获取指定名称的处理器
     * @param name 要获取的处理器名称
     * @returns 对应的 ActionEntry 对象
     */
    get(name: string): ActionEntry;
    /**
     * 获取HTTP场景的处理器流水线
     * 只返回 isHttp 为 true 的项，不参与 domain 和 action 比对
     * @returns HTTP处理器流水线
     */
    getHttpPipeline(): ActionEntry[];
    /**
     * 获取准备阶段的处理器流水线
     * @returns 准备阶段处理器流水线
     */
    getPreparePipeline(): ActionEntry[];
    /**
     * 获取所有处理器流水线
     * @returns 所有处理器流水线
     */
    getPipeline(): ActionEntry[];
    /**
     * 根据过滤条件获取处理器流水线
     * @param filterFn 过滤函数，用于确定哪些ActionEntry应该包含在结果中
     * @returns 符合过滤条件的处理器流水线
     */
    private getPipelineByFilter;
    /**
     * 清除所有缓存
     */
    private clearCache;
    /**
     * 覆写基类的 clear 方法，同时清理缓存
     */
    clear(): void;
    /**
     * 注销处理器
     * @param name 要注销的处理器名称
     */
    unregister(name: string): void;
    /**
     * 输出注册器内容详情
     */
    protected doInspect(): void;
}
//# sourceMappingURL=EntityActionRegistrar.d.ts.map