import { AbilityBase } from '../../../composable';
import { IBaseEntityManager, IEntity, IExposeResult, IFlatLocalEntityState, ILocalSearchParams } from '../../../types';
export declare class FlatLocalStateAbility<T extends IEntity, TSearch extends ILocalSearchParams, TState extends IFlatLocalEntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露集合相关的状态属性
     *
     * @returns 包含集合状态属性的对象，如加载状态、项目列表、分页信息等
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=FlatLocalStateAbility.d.ts.map