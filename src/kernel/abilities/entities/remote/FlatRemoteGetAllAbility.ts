import { DebounceAbilityBase } from '../../../composable';
import {
    IEntity,
    IBaseEntityManager,
    IExposeResult,
    SearchParams,
    IFlatRemoteEntityState,
} from '../../../types';


export class FlatRemoteGetAllAbility<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends IFlatRemoteEntityState<T, TSearch>,
> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露外部可调用的方法
     *
     * @returns 返回包含 getAll 方法的对象，供外部使用
     */
    protected expose(): IExposeResult {
        const debouncedFetch = this.getDebouncedAction('get-all', this.internalGetAll, 300, true);
        return {
            getAll: (): Promise<T[]> => debouncedFetch(),
        };
    }

    protected async internalGetAll(): Promise<T[]> {
        const { host } = this;
        const state = host.state;
        const options = host.buildOptions('get-all', {}, {}, {});
        const context = await host.fetch('get-all', options);
        const items = context.data.list;
        await state.updateData(items, items.length);
        return state.items;
    }
}
