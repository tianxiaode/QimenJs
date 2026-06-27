import { AbilityBase, type IExposeResult } from '@/composable';

/**
 * LocalListAbility - 本地列表能力
 * 
 * 提供从远程获取数据填充本地 sourceData 的能力。
 * UI 绑定 state.items 后，搜索条件变化会自动触发重绘。
 */
export class LocalListAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            list: async () => {
                const host = this.host;
                const { state } = host;
                const options = await host.buildOptions('list', state.toParams(), null, {});
                const context = await host.fetch('list', options);
                
                await state.updateData(context.data.list || []);
                host.emit('listed', state.items);
                return state.items;
            },

            refresh: async () => {
                this.host.list();
            },

            filter: (keyword: string) => {
                const { state } = this.host;
                state.search.keyword = keyword;
                return state.items;
            },

            sort: (sortBy: string, sortOrder: 'asc' | 'desc') => {
                const { state } = this.host;
                state.search.sortBy = sortBy;
                state.search.sortOrder = sortOrder;
                return state.items;
            },
        };
    }
}
