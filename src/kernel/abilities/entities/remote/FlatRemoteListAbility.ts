import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    IFlatRemoteEntityState,
    IFlatSearchParams,
} from '../../../types';
import { DebounceAbilityBase } from '../../../composable';

export class FlatRemoteListAbility<
    T extends IEntity,
    TSearch extends IFlatSearchParams,
    TState extends IFlatRemoteEntityState<T, TSearch>,
> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult {
        const { host } = this;
        const state = host.state;
        // 内部防抖执行器
        const debouncedFetch = this.getDebouncedAction('list', this.internalList,300, false);

        return {
            /**
             * 普通查询：受 300ms 防抖控制
             */
            list: async () => {
                return debouncedFetch(false);
            },

            /**
             * 强制刷新：可以直接调用或配置为立即执行
             */
            refresh: async () => {
                // 刷新通常希望立即响应，如果需要，可以为 refresh 单独创建无延迟的防抖
                return debouncedFetch(true);
            },
        };
    }

    protected async internalList(force: boolean = false): Promise<T[]> {
        const { host } = this;
        const state = host.state;
        if (!force) {
            const cached = await state.tryGetCache(); //
            if (cached) {
                // 假设状态机有 updateData 逻辑处理 items 和 total
                state.updateData(cached.items, cached.total);
                host.emit('listed', cached.items);
                return cached.items;
            }
        }

        // 2. 穿透缓存或强制刷新，获取最新参数
        const params = host.state.toParams();

        // 2. 构建 options，如果是刷新，可以在 meta 或 params 中标记 force
        const options = await host.buildOptions('list', params, null, {});

        const context = await host.fetch('list', options);

        const { list, total } = context.data;
        // 3. 同步状态
        host.state.updateData(list, total);
        host.emit('listed', list);
        return state.items;
    }
}
