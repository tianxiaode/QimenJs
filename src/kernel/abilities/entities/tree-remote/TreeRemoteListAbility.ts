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
        const { host } = this;
        const { state } = host;

        const debouncedFetch = this.createDebounced(
            'list',
            async (parentId: string | number | null = null, forceRefresh: boolean = false) => {
                const host = this.host;
                const state = host.state;
                // 1. 如果不是强制刷新，先检查内存里是否已经加载过这个节点的子级
                if (!forceRefresh && this.host.state.hierarchy.has(parentId)) {
                    return; // 已经有数据了，直接利用 state.items 自动计算显示
                }

                // 2. 否则，抓取数据
                const params = { ...state.toParams(), parentId };
                const options = await host.buildOptions('list', params, null, {});

                const context = await host.fetch('list', options);

                const data = context.data; // 可能是数组或带结构的节点

                // 3. 挂载数据到指定父节点
                state.updateData(data.list, parentId);
                return state.items;
            },
            300
        );

        return {
            // 加载或展开
            list: (parentId: string | number | null = null) => debouncedFetch(parentId, false),
            // 刷新（默认刷新整棵树）
            refresh: (parentId: string | number | null = null) => debouncedFetch(parentId, true),
        };
    }
}
