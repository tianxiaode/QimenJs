import { IBaseEntityManager, IEntity, IExposeResult, IFlatRemoteEntityState, IFlatSearchParams } from '../../../types';
import { DebounceAbilityBase } from '../../../composable';
export declare class FlatRemoteListAbility<T extends IEntity, TSearch extends IFlatSearchParams, TState extends IFlatRemoteEntityState<T, TSearch>> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult;
    protected internalList(force?: boolean): Promise<T[]>;
}
//# sourceMappingURL=FlatRemoteListAbility.d.ts.map