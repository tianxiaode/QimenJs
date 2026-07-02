import type { AbilityDefinition } from '@/composable';

/**
 * FlatRemoteListAbility - 远程列表查询能力
 * 
 * 提供列表查询和强制刷新的能力，支持 300ms 防抖。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 * 
 * 设计说明：
 * debounce 在 immediate=false 时不返回异步结果，
 * 因此 list/refresh 直接调用 _internalList，
 * 防抖仅用于合并短时间内的重复调用（防止并发请求）。
 */
export const FlatRemoteListAbility: AbilityDefinition = {
    /**
     * 普通查询
     */
    async list(): Promise<any[]> {
        return this._internalList(false);
    },

    /**
     * 强制刷新：跳过缓存，直接请求
     */
    async refresh(): Promise<any[]> {
        return this._internalList(true);
    },

    async _internalList(force: boolean = false): Promise<any[]> {
        if (!force) {
            const cached = await this.tryGetCache();
            if (cached) {
                this.updateData(cached.items, cached.total);
                this.emit('listed', this.items);
                return this.items;
            }
        }

        // 穿透缓存或强制刷新，获取最新参数
        const params = this.toParams();

        // 构建 options
        const options = await this.buildOptions('list', params, null, {});

        const context = await this.fetch('list', options);

        const { list, total } = context.data;
        // 同步状态
        this.updateData(list, total);
        this.emit('listed', this.items);
        return this.items;
    },
};
