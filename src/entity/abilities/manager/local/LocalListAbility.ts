import type { AbilityDefinition } from '@/composable';

/**
 * LocalListAbility - 本地列表能力
 * 
 * 提供从远程获取数据填充本地 sourceData 的能力。
 * UI 绑定 state.items 后，搜索条件变化会自动触发重绘。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const LocalListAbility: AbilityDefinition = {
    async list() {
        const { state } = this;
        const options = await this.buildOptions('list', state.toParams(), null, {});
        const context = await this.fetch('list', options);
        
        await state.updateData(context.data.list || []);
        this.emit('listed', state.items);
        return state.items;
    },

    async refresh() {
        this.list();
    },

    filter(keyword: string) {
        const { state } = this;
        state.search.keyword = keyword;
        return state.items;
    },

    sort(sortBy: string, sortOrder: 'asc' | 'desc') {
        const { state } = this;
        state.search.sortBy = sortBy;
        state.search.sortOrder = sortOrder;
        return state.items;
    },
};
