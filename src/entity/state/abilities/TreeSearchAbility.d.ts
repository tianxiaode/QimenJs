import { AbilityBase } from '../../../composable';
import { IEntity, IExposeResult, ITreeSearchParams, ITreeRemoteEntityState } from '../../../types';
export declare class TreeSearchAbility<T extends IEntity, TSearch extends ITreeSearchParams> extends AbilityBase<ITreeRemoteEntityState<T, TSearch>> {
    protected expose(): IExposeResult;
    protected applySearchExpansion(): void;
    protected applySort(list: T[]): T[];
    protected matchKeyword(node: T, keyword: string): boolean;
}
//# sourceMappingURL=TreeSearchAbility.d.ts.map