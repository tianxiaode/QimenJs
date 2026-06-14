import { AbilityBase } from '../../../composable';
import { IEntity, IExposeResult, ITreeSearchParams, ITreeRemoteEntityStateExtenstion } from '../../../types';
export declare class TreeLifecycleAbility<T extends IEntity, TSearch extends ITreeSearchParams> extends AbilityBase<ITreeRemoteEntityStateExtenstion<T, TSearch>> {
    protected expose(): IExposeResult;
    protected removeNode(id: string | number): void;
    moveNode(id: string | number, targetPid: string | number | null): void;
    protected syncChildren(pid: string | number | null, newData: T[]): void;
    protected getChildren(pid?: string | number | null, predicate?: (node: T) => boolean): T[];
}
//# sourceMappingURL=TreeLifecycleAbility.d.ts.map