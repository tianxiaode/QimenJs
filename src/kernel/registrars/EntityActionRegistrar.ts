import { RegistrarBase } from '@orbitjs/registry';
import { ActionCategory, ActionEntry } from '../types';

export const EntityActionRegistrarName = 'action';

export class EntityActionRegistrar extends RegistrarBase<Map<string, ActionEntry>> {
    public readonly name = EntityActionRegistrarName;
    protected storage = new Map<string, ActionEntry>();
    
    // 缓存池
    private httpPipelineCache: ActionEntry[] | null = null;
    private domainActionPipelineCache = new Map<string, ActionEntry[]>();

    /**
     * 注册一个处理器
     * @param name 处理器的唯一标识 (如 'UserAction')
     * @param action 包含实体关联、域关联及函数的对象
     */
    register(action: ActionEntry): void {
        this.checkLock();
        // 这里可以增加检查：校验 entity 和 domain 是否已在 Registry 中存在
        this.storage.set(action.name, action);
        
        // 注册新处理器后清除缓存
        this.clearCache();
    }

    /**
     * 获取处理器
     */
    get(name: string): ActionEntry {
        return this.storage.get(name)!;
    }

    /**
     * 获取HTTP场景的处理器流水线
     * 只返回 isHttp 为 true 的项，不参与 domain 和 action 比对
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
     * 获取基于域和动作的处理器流水线
     * 所有项都参与 domain 和 action 比对
     */
    getDomainActionPipeline(domain: string, action?: string): ActionEntry[] {
        // 创建缓存键
        const cacheKey = `${domain}_${action || '*'}`;
        
        // 检查缓存是否存在
        if (this.domainActionPipelineCache.has(cacheKey)) {
            return this.domainActionPipelineCache.get(cacheKey)!;
        }
        
        // 缓存不存在，重新计算并存储
        const pipeline = this.getPipelineByFilter(item => {
            // 域匹配逻辑：
            // - 如果零件没写 domain，说明是全局通用的
            // - 如果写了 domain，必须和传入的匹配
            const domainMatch = !item.domain || item.domain === domain;

            // 动作匹配逻辑：
            // - 如果零件没写 actionName，说明是该 domain 下所有动作通用的
            // - 如果写了，必须匹配
            const actionMatch = !item.action || item.action === action;

            return domainMatch && actionMatch;
        });
        
        this.domainActionPipelineCache.set(cacheKey, pipeline);
        
        return pipeline;
    }


    /**
     * 根据过滤条件获取处理器流水线
     */
    private getPipelineByFilter(filterFn: (item: ActionEntry) => boolean): ActionEntry[] {
        const allActions = Array.from(this.storage.values());
        const filteredActions = allActions.filter(filterFn);
        
        return filteredActions
            .sort((a, b) => b.category + b.offset - (a.category + a.offset))
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
        
        // 注销处理器后清除缓存
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
            // === 前置阶段 ===
            ActionCategory.PREPARE,
            ActionCategory.ENRICH,
            
            // === 拦截阶段 ===
            ActionCategory.GUARD,
            ActionCategory.VALIDATE,
            
            // === 执行阶段 ===
            ActionCategory.IO,
            
            // === 后置阶段 ===
            ActionCategory.TRANSFORM,
            ActionCategory.FALLBACK,
            
            // === 副作用阶段 ===
            ActionCategory.EFFECT
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
                Domain: item.domain || '*',
                Description: item.description,
                'HTTP?': item.isHttp ? '✅' : '❌',
            }));

            console.table(tableData);
        });
    }
}

