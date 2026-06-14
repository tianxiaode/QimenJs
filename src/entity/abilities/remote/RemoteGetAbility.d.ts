import { AbilityBase } from '../../../composable';
import { EntityState, IEntity, IBaseEntityManager, IExposeResult, SearchParams } from '../../../types';
export declare class RemoteGetAbility<T extends IEntity, TSearch extends SearchParams, TState extends EntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露远程获取实体的方法
     *
     * @returns 包含 remoteGet 方法的对象，用于远程获取单个实体
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=RemoteGetAbility.d.ts.map