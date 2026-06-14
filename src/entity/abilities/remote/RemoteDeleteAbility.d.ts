import { AbilityBase } from '../../../composable';
import { EntityState, IBaseEntityManager, IEntity, IExposeResult, SearchParams } from '../../../types';
/**
 * RemoteDeleteAbility - 远程删除能力
 *
 * 提供删除远程实体的能力，通过HTTP请求与服务器交互。
 * 支持单个或批量删除操作，并自动更新本地状态。
 *
 * @template T - 实体的数据类型
 * @template TCriteria - 搜索字段类型
 */
export declare class RemoteDeleteAbility<T extends IEntity, TSearch extends SearchParams, TState extends EntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露远程删除实体的方法
     *
     * @returns 包含 remoteDelete 方法的对象，用于远程删除实体
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=RemoteDeleteAbility.d.ts.map