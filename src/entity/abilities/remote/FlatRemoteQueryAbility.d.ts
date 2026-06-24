import { AbilityBase } from '../../../composable';
import { IBaseEntityManager, IEntity, IExposeResult, IFlatRemoteEntityState, IFlatSearchParams } from '../../../types';
export declare class FlatRemoteQueryAbility<T extends IEntity, TSearch extends IFlatSearchParams, TState extends IFlatRemoteEntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult;
}
//# sourceMappingURL=FlatRemoteQueryAbility.d.ts.map