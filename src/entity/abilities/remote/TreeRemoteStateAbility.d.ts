import { AbilityBase } from '../../../composable';
import { IBaseEntityManager, IEntity, IExposeResult, ITreeRemoteEntityState, ITreeSearchParams } from '../../../types';
/**
 * CollectionAbility - 集合能力
 *
 * 提供对实体集合的基本访问接口，包括加载状态、项目数量、分页信息等
 */
export declare class TreeRemoteStateAbility<T extends IEntity, TSearch extends ITreeSearchParams, TState extends ITreeRemoteEntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露集合相关的状态属性
     *
     * @returns 包含集合状态属性的对象，如加载状态、项目列表、分页信息等
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=TreeRemoteStateAbility.d.ts.map