import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

export class RemoteDeleteAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 远程删除：直接发起 API 调用
             * 根据参数类型自动识别 delete 或 batch-delete
             */
            delete: async (target: any | any[]): Promise<void> => {
                const ids = Array.isArray(target) ? target : [target];
                if (ids.length === 0) return;

                const action = ids.length === 1 ? 'delete' : 'batch-delete';
                const payload = ids.length === 1 ? ids[0] : ids;

                await host.fetch(action, payload, () => {
                    // 内部工具：物理移除 state.items 中的项
                    this.physicallyRemove(ids);
                    host.emit('deleted', ids);
                });
            }
        };
    }

    private physicallyRemove(ids: any[]) {
        const { host } = this;
        const idKey = host.schemaKeys.id;
        if (Array.isArray(host.state.items)) {
            host.state.items = host.state.items.filter((i: any) => !ids.includes(i[idKey]));
            host.state.total = Math.max(0, (host.state.total || 0) - ids.length);
        }
        if (host.state.item && ids.includes(host.state.item[idKey])) {
            host.state.item = null;
        }
    }
}