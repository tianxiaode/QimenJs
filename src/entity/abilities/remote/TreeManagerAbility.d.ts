import { IBaseEntityManager, IEntity, IExposeResult, ITreeRemoteEntityStateExtenstion, ITreeSearchParams } from '../../../types';
import { DebounceAbilityBase } from '../../../composable';
export declare class TreeManagerAbility<T extends IEntity, TSearch extends ITreeSearchParams, TState extends ITreeRemoteEntityStateExtenstion<T, TSearch>> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult;
    /**
     * 设置展开/折叠状态
     */
    protected setExpandState(id: string | number, expanded: boolean): void;
    protected expand(id: string | number): Promise<void>;
    /**
     * 核心方法：刷新子节点
     * 替代了之前在 fetch 里的 updater 回调逻辑
     */
    protected refreshChildren(pid: string | number | null): Promise<void>;
    protected moveNode(id: string | number, targetPid: string | number | null): Promise<void>;
}
//# sourceMappingURL=TreeManagerAbility.d.ts.map