import type { AbilityDefinition } from '@/composable';

/**
 * FlatRemoteListAbility - 远程列表查询能力
 * 
 * 提供列表查询和强制刷新的能力，支持 300ms 防抖。
 * this 指向宿主（Manager），this.state 可直接访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 */
export const FlatRemoteListAbility: AbilityDefinition = {
    /**
     * 普通查询：受 300ms 防抖控制
     */
    async list(): Promise<any[]> {
        return this.debounce('list', (force: boolean) => this._internalList(force), 300, false)(false);
    },

    /**
     * 强制刷新：可以直接调用或配置为立即执行
     */
    async refresh(): Promise<any[]> {
        return this.debounce('list', (force: boolean) => this._internalList(force), 300, false)(true);
    },

    async _internalList(force: boolean = false): Promise<any[]> {
        const state = this.state;
        if (!force) {
            const cached = await state.tryGetCache();
            if (cached) {
                state.updateData(cached.items, cached.total);
                this.emit('listed', cached.items);
                return cached.items;
            }
        }

        // 穿透缓存或强制刷新，获取最新参数
        const params = this.state.toParams();

        // 构建 options
        const options = await this.buildOptions('list', params, null, {});

        const context = await this.fetch('list', options);

        const { list, total } = context.data;
        // 同步状态
        await this.state.updateData(list, total);
        this.emit('listed', state.items);
        return state.items;
    },
};
