import { AbilityBase } from '../../../composable';
import { IEntity, IExposeResult, ITreeSearchParams, ITreeRemoteEntityStateExtenstion } from '../../../types';
export declare class TreePathAbility<T extends IEntity, TSearch extends ITreeSearchParams> extends AbilityBase<ITreeRemoteEntityStateExtenstion<T, TSearch>> {
    /**
     * 暴露远程获取实体的方法
     *
     * @returns 包含 remoteGet 方法的对象，用于远程获取单个实体
     */
    protected expose(): IExposeResult;
    protected ingest(data: T | T[], manualParentId?: string | number | null): void;
    protected rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number): void;
    protected toggleExpand(id: string | number | T, expanded?: boolean): void;
    protected toggleLeaf(id: string | number | T, leaf?: boolean): void;
}
//# sourceMappingURL=TreePathAbility.d.ts.map