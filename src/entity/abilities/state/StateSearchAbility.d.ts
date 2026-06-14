import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';
export declare class StateSearchAbility<T extends IEntity, TSearch extends SearchParams> extends AbilityBase<IBaseEntityState<T, TSearch>> {
    protected expose(): IExposeResult;
    protected getDefaultSearch(): TSearch;
    private toParams;
    private matchKeyword;
    private applySort;
}
//# sourceMappingURL=StateSearchAbility.d.ts.map