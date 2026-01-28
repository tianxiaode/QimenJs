import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    ITreeRemoteEntityState,
    ITreeSearchParams,
} from '../../../types';
import { DebounceAbilityBase } from '../../../composable';

export class TreeRemoteListAbility<
    T extends IEntity,
    TSearch extends ITreeSearchParams,
    TState extends ITreeRemoteEntityState<T, TSearch>,
> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    
    protected expose(): IExposeResult {
        // 使用动态代理模式包装防抖方法，避免 keyof this 带来的类型推导问题
        const debouncedFetch = this.getDebouncedAction('internalFetch', this.internalFetch, 300);

        return {
            /**
             * 加载节点列表：
             * 对于树而言，通常是加载当前 search.parentId 下的直接子节点
             */
            list: async () => {
                return debouncedFetch(false);
            },

            /**
             * 强制刷新当前层级
             */
            refresh: async () => {
                return debouncedFetch(true);
            },

            /**
             * 加载指定父节点的子节点（常用于树组件的异步展开）
             * @param parentId 父节点 ID
             */
            loadChildren: async (parentId: string | number) => {
                const { state } = this.host;
                // 暂时切换查询上下文
                const originalPid = state.search.parentId;
                state.search.parentId = parentId;
                
                try {
                    return await debouncedFetch(true);
                } finally {
                    // 恢复原始上下文（可选，视具体业务 UI 逻辑而定）
                    state.search.parentId = originalPid;
                }
            }
        };
    }

    /**
     * 核心获取逻辑
     * @param force 是否强制跳过缓存
     */
    protected async internalFetch(force: boolean = false) {
        const { host } = this;
        const state = host.state;
        const schema = host.getSchema();

        // 1. 尝试从缓存或内存中查找
        // 对于树，如果 state.hierarchy 中已经有了该 parentId 的记录，且非强制刷新，可直接返回
        if (!force && !state.search.keyword) {
            const targetId = state.search.parentId || schema.root || 'ROOT';
            if (state.hierarchy.has(targetId)) {
                const items = state.items; // 利用 state.ts 中的 items getter 获取当前层级
                host.emit('listed', items);
                return items;
            }
        }

        // 2. 构建请求参数 (TreeRemoteEntityState 会自动处理 parentId 默认值)
        const params = state.toParams();
        const options = await host.buildOptions('list', params, null, {});

        // 3. 调用 fetch
        const context = await host.fetch('list', options);

        /**
         * 4. 同步状态：
         * 使用 TreeRemoteEntityState 的 updateData 方法。
         * 它内部调用了 ingest，会自动建立 nodes 映射和 hierarchy 父子关联索引。
         */
        await state.updateData(context.data.list); 
        
        const currentItems = state.items;
        host.emit('listed', currentItems);
        return currentItems;
    }
}