import type { AbilityDefinition } from '@/composable';

/**
 * LocalListAbility - 本地列表能力
 * 
 * 提供从远程获取数据填充本地 sourceData 的能力。
 * UI 绑定 items 后，搜索条件变化会自动触发重绘。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const LocalListAbility: AbilityDefinition = {
    async list() {
        const options = await this.buildOptions('list', this.toParams(), null, {});
        const context = await this.fetch('list', options);
        
        await this.updateData(context.data.list || []);
        this.emit('listed', this.items);
        return this.items;
    },

    async refresh() {
        this.list();
    },

    filter(keyword: string) {
        this.search.keyword = keyword;
        return this.items;
    },

    sort(sortBy: string, sortOrder: 'asc' | 'desc') {
        this.search.sortBy = sortBy;
        this.search.sortOrder = sortOrder;
        return this.items;
    },
};
