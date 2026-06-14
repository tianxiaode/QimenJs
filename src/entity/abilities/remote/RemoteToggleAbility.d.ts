import { DebounceAbilityBase } from '../../../composable';
import { EntityState, IBaseEntityManager, IEntity, IExposeResult, SearchParams } from '../../../types';
/**
 * RemoteToggleAbility - 远程状态切换能力
 *
 * 允许对实体的布尔字段进行远程切换操作（如启用/禁用），支持：
 * - 乐观 UI 更新（立即响应，提升用户体验）
 * - 防抖提交（避免频繁请求）
 * - 操作失败自动回滚
 * - 支持同一资源不同字段独立控制
 *
 * @template T 实体数据类型
 * @template TCriteria 搜索字段类型（用于条件筛选等场景，当前主要用于扩展性预留）
 */
export declare class RemoteToggleAbility<T extends IEntity, TSearch extends SearchParams, TState extends EntityState<T, TSearch>> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露可被外部调用的方法集合
     *
     * @protected
     * @returns {IExposeResult} 包含 toggle 方法的对象
     */
    protected expose(): IExposeResult;
    protected internalToggle(item: T, field: keyof T): Promise<T>;
}
//# sourceMappingURL=RemoteToggleAbility.d.ts.map