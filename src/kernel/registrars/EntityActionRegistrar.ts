import { RegistrarBase } from '@/registry'; // 更新导入语句为 '@/registry'
import { ActionCategory, ActionEntry } from '../types';
import { EntityActionRegistrarError, KernelErrorCode } from '../errors';

/**
 * EntityActionRegistrar 名称常量
 */
export const EntityActionRegistrarName = 'action';

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
export class EntityActionRegistrar extends RegistrarBase<Map<string, ActionEntry>> {
    public readonly name = EntityActionRegistrarName;
    
    /**
     * 存储所有已注册的动作处理器
     * key: 动作名称
     * value: ActionEntry对象
     */
    protected storage = new Map<string, ActionEntry>();
    
    // 缓存池，用于优化性能
    /**
     * HTTP管道缓存，存储所有isHttp为true的动作
     */
    private httpPipelineCache: ActionEntry[] | null = null;
    
    /**
     * 域动作管道缓存，按域分组存储动作
     */
    private domainActionPipelineCache = new Map<string, ActionEntry[]>();

    /**
     * 注册一个处理器
     * @param action 包含动作名称、类别、描述、处理器函数等信息的ActionEntry对象
     */
    register(action: ActionEntry): void {
        this.checkLock();
        // 这里可以增加检查：校验 entity 和 domain 是否已在 Registry 中存在
        this.storage.set(action.name, action);
        
        // 注册新处理器后清除缓存，确保下次获取时重新计算
        this.clearCache();
    }

    /**
     * 获取指定名称的处理器
     * @param name 要获取的处理器名称
     * @returns 对应的 ActionEntry 对象
     */
    get(name: string): ActionEntry {
        const action = this.storage.get(name);
        if (!action) {
            throw new EntityActionRegistrarError(
                `[EntityActionRegistrar] Action with name "${name}" not found.`,
                KernelErrorCode.ACTION_NOT_FOUND,
                { actionName: name }
            );
        }
        return action;
    }

    /**
     * 获取HTTP场景的处理器流水线
     * 只返回 isHttp 为 true 的项，不参与 domain 和 action 比对
     * @returns HTTP处理器流水线
     */
    getHttpPipeline(): ActionEntry[] {
        // 检查缓存是否存在
        if (this.httpPipelineCache !== null) {
            return this.httpPipelineCache;
        }
        
        // 缓存不存在，重新计算并存储
        this.httpPipelineCache = this.getPipelineByFilter(item => 
            typeof item.isHttp === 'boolean' && item.isHttp === true
        );
        
        return this.httpPipelineCache;
    }

    /**
     * 获取准备阶段的处理器流水线
     * @returns 准备阶段处理器流水线
     */
    getPreparePipeline(): ActionEntry[] {
        return this.getPipelineByFilter(item => item.category === ActionCategory.PREPARE);
    }

    /**
     * 获取所有处理器流水线
     * @returns 所有处理器流水线
     */
    getPipeline(): ActionEntry[] {
        return Array.from(this.storage.values());
    }


    /**
     * 根据过滤条件获取处理器流水线
     * @param filterFn 过滤函数，用于确定哪些ActionEntry应该包含在结果中
     * @returns 符合过滤条件的处理器流水线
     */
    private getPipelineByFilter(filterFn: (item: ActionEntry) => boolean): ActionEntry[] {
        const allActions = Array.from(this.storage.values());
        return allActions.filter(filterFn);        
    }

    /**
     * 清除所有缓存
     */
    private clearCache(): void {
        this.httpPipelineCache = null;
        this.domainActionPipelineCache.clear();
    }

    /**
     * 覆写基类的 clear 方法，同时清理缓存
     */
    clear(): void {
        super.clear();
        this.clearCache();
    }

    /**
     * 注销处理器
     * @param name 要注销的处理器名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
        
        // 注销处理器后清除缓存，确保下次获取时重新计算
        this.clearCache();
    }

    /**
     * 输出注册器内容详情
     */
    protected doInspect(): void {
        console.log(
            `%c [EntityAction Registry] Inspection Report `,
            'background: #333; color: #fff; font-weight: bold; padding: 4px;'
        );

        // 1. 先按 Category 分组
        const groups = new Map<ActionCategory, ActionEntry[]>();
        Array.from(this.storage.values()).forEach(action => {
            const list = groups.get(action.category) || [];
            list.push(action);
            groups.set(action.category, list);
        });

        // 2. 按照 ActionCategory 枚举定义的顺序迭代
        const orderedCategories = [
            ActionCategory.PREPARE,
            ActionCategory.EXCHANGE,            
            ActionCategory.PROCESS,
            ActionCategory.ALIGN,
            
        ];

        orderedCategories.forEach(cat => {
            const list = groups.get(cat);
            if (!list || list.length === 0) return;

            // 获取枚举键名
            const categoryName = ActionCategory[cat];
            
            console.log(
                `\n%c >> Category: ${categoryName} (${cat}) `,
                'color: #2196F3; font-weight: bold; border-left: 4px solid #2196F3; padding-left: 8px;'
            );

            // 3. 在分类内部按 Stage 和 Offset 排序
            const sortedList = list.sort((a, b) => {
                const weightA = a.category + a.offset;
                const weightB = b.category + b.offset;
                return weightB - weightA; // 权重高的排前面
            });

            // 4. 格式化为表格输出
            const tableData = sortedList.map((item: ActionEntry) => ({
                'Priority(Stage+Offset)': item.category + item.offset,
                Action: item.name || '*',
                Description: item.description,
                'HTTP?': item.isHttp ? '✅' : '❌',
            }));

            console.table(tableData);
        });
    }
}