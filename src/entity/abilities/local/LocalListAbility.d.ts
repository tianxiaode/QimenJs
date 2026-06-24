import { IBaseEntityManager, IEntity, IExposeResult, ILocalEntityState, ILocalSearchParams } from '../../../types';
import { AbilityBase } from '../../../composable';
export declare class LocalListAbility<T extends IEntity, TSearch extends ILocalSearchParams, TState extends ILocalEntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult;
}
//# sourceMappingURL=LocalListAbility.d.ts.map