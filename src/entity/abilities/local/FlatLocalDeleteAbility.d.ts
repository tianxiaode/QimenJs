import { IBaseEntityManager, IEntity, IExposeResult, IFlatLocalEntityState, ILocalSearchParams } from '../../../types';
import { AbilityBase } from '../../../composable';
export declare class FlatLocalDeleteAbility<T extends IEntity, TSearch extends ILocalSearchParams, TState extends IFlatLocalEntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult;
}
//# sourceMappingURL=FlatLocalDeleteAbility.d.ts.map