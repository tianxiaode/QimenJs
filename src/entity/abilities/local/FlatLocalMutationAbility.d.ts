import { IBaseEntityManager, IEntity, IExposeResult, IFlatLocalEntityState, ILocalSearchParams } from '../../../types';
import { DebounceAbilityBase } from '../../../composable';
export declare class FlatLocalMutationAbility<T extends IEntity, TSearch extends ILocalSearchParams, TState extends IFlatLocalEntityState<T, TSearch>> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult;
    protected internalSave(isBatch?: boolean): Promise<void>;
}
//# sourceMappingURL=FlatLocalMutationAbility.d.ts.map