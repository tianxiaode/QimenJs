import { AbilityBase } from '../../../composable';
import {
    IBaseEntityManager,
    IDeletionPlan,
    IEntity,
    IExposeResult,
    IFlatLocalEntityState,
    ILocalSearchParams,
} from '../../../types';

export class FlatLocalStateAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露集合相关的状态属性
     *
     * @returns 包含集合状态属性的对象，如加载状态、项目列表、分页信息等
     */
    protected expose(): IExposeResult {
        const { state, logger } = this.host;

        // 使用基类提供的批量注入方法
        return {
            // 每一个属性都通过 get 访问器代理到 state 上
            loading: { get: () => state.loading },
            isEmpty: { get: () => state.items.length === 0 },
            total: { get: () => state.items.length },
            items: { get: () => state.items },
            hasChanges: { get: () => state.hasChanges },
            getDeletionPlan: (ids: (string | number)[]): IDeletionPlan => state.getDeletionPlan(ids),
            adds: { get: () => state.changes.added },
            updates: { get: () => state.changes.updated },
        };
    }
}
