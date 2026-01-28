import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    IFlatLocalEntityState,
    ILocalSearchParams,
} from '../../../types';
import { AbilityBase } from '../../../composable';


export class FlatLocalDeleteAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {

    protected expose(): IExposeResult {
        const { host } = this;
        const { state } = host;

        return {
            /**
             * 独立删除能力
             * @param ids 要删除的 ID 数组
             * @param immediate 是否立即同步到后端（针对已持久化的数据）
             */
            delete: async (ids: (string | number)[], immediate: boolean = true) => {
                // 1. 调用 state 的分流逻辑
                const plan = state.getDeletionPlan(ids);

                // 2. 处理本地新增数据：直接抹除，无需网络请求
                if (plan.localOnly.length > 0) {
                    state.delete(plan.localOnly); //
                }

                // 3. 处理已持久化数据
                if (plan.persistent.length > 0) {
                    if (immediate) {
                        // 立即执行物理删除
                        const options = await host.buildOptions('delete', plan.persistent, null, {});
                        await host.fetch('delete', options);
                        // 成功后才从内存移除 sourceData
                        state.delete(plan.persistent); 
                    } else {
                        // 延迟处理：仅仅从当前视图 items 中移除，不立即发请求
                        // 这需要 state 支持标记删除或放入待删缓冲区
                        state.delete(plan.persistent); 
                    }
                }

                host.emit('deleted', ids);
                return plan;
            }
        };
    }
}