import type { AbilityDefinition } from '@/composable';

/**
 * FlatRemoteGetAllAbility - 远程获取全部数据能力
 *
 * 提供获取全部数据的能力，支持 300ms leading 防抖。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 */
export const FlatRemoteGetAllAbility: AbilityDefinition = {
    getAll(): Promise<any[]> {
        return this.debounce('get-all', () => this._internalGetAll(), 300, true)();
    },

    async _internalGetAll(): Promise<any[]> {
        const options = await this.buildOptions('get-all', {}, {}, {});
        const context = await this.fetch('get-all', options);
        const items = context.data.list;
        this.updateData(items, items.length);
        return this.items;
    },
};
