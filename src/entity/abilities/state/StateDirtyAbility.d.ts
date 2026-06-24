import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';
export declare class StateDirtyAbility<T extends IEntity, TSearch extends SearchParams> extends AbilityBase<IBaseEntityState<T, TSearch>> {
    private _snapshots;
    protected expose(): IExposeResult;
    protected onDispose(): void;
}
//# sourceMappingURL=StateDirtyAbility.d.ts.map