import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';
export declare class StateSchemaAbility<T extends IEntity, TSearch extends SearchParams, TState extends IBaseEntityState<T, TSearch>> extends AbilityBase<TState> {
    protected expose(): IExposeResult;
}
//# sourceMappingURL=StateSchemaAbility.d.ts.map