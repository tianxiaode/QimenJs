import { IBaseEntityState, IEntity, IExposeResult, ILocalChangeSet, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';
export declare class StateLocalMutationAbility<T extends IEntity, TSearch extends SearchParams> extends AbilityBase<IBaseEntityState<T, TSearch>> {
    private _changes;
    private _deleteSnapshots;
    protected expose(): IExposeResult;
    private commitChange;
    private getMapKey;
    protected createEmptyChanges(): ILocalChangeSet<T>;
    protected delete(id: string | number | (string | number)[]): Promise<void>;
    protected onDispose(): void;
}
//# sourceMappingURL=StateLocalMutationAbility.d.ts.map