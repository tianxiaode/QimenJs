import type { AbilityDefinition } from '@/composable';
import { ENTITY_CRUD_EVENTS } from '@/events';

/**
 * RemoteToggleAbility - 远程状态切换能力
 *
 * 允许对实体的布尔字段进行远程切换操作（如启用/禁用），支持：
 * - 乐观 UI 更新（立即响应，提升用户体验）
 * - 防抖提交（避免频繁请求）
 * - 操作失败自动回滚
 * - 支持同一资源不同字段独立控制
 *
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 */
export const RemoteToggleAbility= {
    async toggle(item: any, field: string): Promise<any> {
        return this.debounce(
            'toggle',
            (i: any, f: string) => this._internalToggle(i, f),
            400,
            true
        )(item, field);
    },

    async _internalToggle(item: any, field: string): Promise<any> {
        const idField = this.idField;
        const id = item[idField];

        // 1. 乐观更新：记录旧值，并立即更新 UI 上的字段值
        const oldValue = item[field];
        item[field] = !oldValue;
        try {
            // 2. 触发提交请求
            const options = await this.buildOptions('toggle', { id }, { item, field }, {});
            const context = await this.fetch('toggle', options);
            const finalData = context.data.item || item;
            this.updateItem(finalData);
            this.emit(ENTITY_CRUD_EVENTS.TOGGLED, { id, item: finalData, field });
            return this.item!;
        } catch (error) {
            // 3. 操作失败：回滚到旧值
            item[field] = oldValue;
            this.updateItem(item);
            return this.item!;
        }
    },
} satisfies AbilityDefinition;
