import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    IFlatLocalEntityState,
    ILocalSearchParams,
} from '../../../types';
import { AbilityBase } from '../../../composable';

export class FlatLocalListAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
 
    protected expose(): IExposeResult {
        const { host } = this;
        const { state } = host;

        return {
            /**
             * list: 仅仅是一个通知或手动触发
             * 因为 state.items 是 getter，界面绑定 state.items 后，
             * 只要 search 条件变了，界面就会自动重绘。
             */
            list: async () => {
                const options = await host.buildOptions('list', state.toParams(), null, {});
                const context = await host.fetch('list', options);
                
                    // 调用 state.updateData 会更新 sourceData 并同步缓存
                await state.updateData(context.data.list || []);
                host.emit('listed', state.items);
                return state.items;
            },

            /**
             * refresh: 负责从远程抓取全量数据填充 sourceData
             */
            refresh: async () => {
                host.list();
            },

            /**
             * 快捷方法：直接修改状态触发更新
             */
            filter: (keyword: string) => {
                state.search.keyword = keyword;
                // 无需手动 filter，state.items getter 会在下次访问时自动应用新 keyword
                return state.items;
            },

            sort: (sortBy: string, sortOrder: 'asc' | 'desc') => {
                state.search.sortBy = sortBy;
                state.search.sortOrder = sortOrder;
                // 无需手动 sort，state.items getter 会在下次访问时自动应用新 sortBy/sortOrder
                return state.items;
            }
        };
    }
}