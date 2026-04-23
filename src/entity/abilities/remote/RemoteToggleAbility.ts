import { DebounceAbilityBase } from '../../../composable';
import {
    EntityState,
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    SearchParams,
} from '../../../types';

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
export class RemoteToggleAbility<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends EntityState<T, TSearch>,
> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露可被外部调用的方法集合
     *
     * @protected
     * @returns {IExposeResult} 包含 toggle 方法的对象
     */
    protected expose(): IExposeResult {
        const debouncedFetch = this.getDebouncedAction('toggle', this.internalToggle, 400, true);

        return {
            toggle: async (item: T, field: keyof T): Promise<T> => {
                return await debouncedFetch(item, field);
            },
        };
    }

    protected async internalToggle(item: T, field: keyof T): Promise<T> {
        const host = this.host;
        const state = host.state;
        const idField = state.idField;
        const id = item[idField];

        // 1. 乐观更新：记录旧值，并立即更新 UI 上的字段值
        const oldValue = (item as any)[field];
        (item as any)[field] = !oldValue;
        try {
            // 2. 触发提交请求
            const options = await host.buildOptions('toggle', { id }, { item, field }, {});
            const context = await host.fetch('toggle', options);
            const finalData = context.data.item || item;
            await state.updateItem(finalData);
            host.emit('toggled', { id, item: finalData, field });
            return state.item!;
        } catch (error) {
            // 3. 操作失败：回滚到旧值
            (item as any)[field] = oldValue;
            await state.updateItem(item);
            return state.item!;
        }
    }
}
