import { AbilityBase } from '../../../composable';
import { IEntity, IExposeResult, ITreeSearchParams, ITreeRemoteEntityStateExtenstion } from '../../../types';
export declare class TreeViewAbility<T extends IEntity, TSearch extends ITreeSearchParams> extends AbilityBase<ITreeRemoteEntityStateExtenstion<T, TSearch>> {
    protected expose(): IExposeResult;
    protected refreshView(): void;
    protected generateFlatItems(): T[];
    protected generateTreeData(): T[];
}
//# sourceMappingURL=TreeViewAbility.d.ts.map