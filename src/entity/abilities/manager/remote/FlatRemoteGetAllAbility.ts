import { DebounceAbilityBase, type IExposeResult } from '@/composable';

export class FlatRemoteGetAllAbility extends DebounceAbilityBase {
    /**
     * 暴露外部可调用的方法
     *
     * @returns 返回包含 getAll 方法的对象，供外部使用
     */
    protected expose(): IExposeResult {
        const debouncedFetch = this.getDebouncedAction('get-all', this.internalGetAll, 300, true);
        return {
            getAll: (): Promise<any[]> => debouncedFetch(),
        };
    }

    protected async internalGetAll(): Promise<any[]> {
        const host = this.host;
        const state = host.state;
        const options = await host.buildOptions('get-all', {}, {}, {});
        const context = await host.fetch('get-all', options);
        const items = context.data.list;
        await state.updateData(items, items.length);
        return state.items;
    }
}
