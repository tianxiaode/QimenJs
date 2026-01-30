import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    IFlatLocalEntityState,
    ILocalSearchParams,
} from '../../../types';
import { DebounceAbilityBase } from '../../../composable';

export class FlatLocalMutationAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult {
        const { host } = this;
        const { state } = host;

        const debouncedSave = this.getDebouncedAction('save', this.internalSave, 500, false);

        return {
            /**
             * 本地创建：数据仅进入 added 缓冲区
             */
            create: (item: T) => {
                state.add(item); // 调用 state.ts 中的 add 方法
                host.emit('created', item);
                return item;
            },

            /**
             * 本地更新：数据进入 updated 映射表
             */
            update: (item: T) => {
                state.update(item); // 调用 state.ts 中的 update 方法
                host.emit('updated', item);
                return item;
            },

            toggle: (item: T, filed: keyof T, value: any) => {
                const oldValue = item[filed];
                item[filed] = value;
                state.update(item); // 调用 state.ts 中的 update 方法
                host.emit('toggled', item, filed, oldValue, value);
            },

            /**
             * 保存：将本地所有变更同步到远程
             */
            save: (isBatch: boolean = false) => debouncedSave(isBatch),
        };
    }

    protected async internalSave(isBatch: boolean = false) {
        const { host } = this;
        const { state } = host;
        if (!state.hasChanges) return;

        const { added, updated } = state.changes;
        const updatedList = Array.from(updated.values());

        if (isBatch) {
            // --- 场景 A: 全量合并提交 ---
            const allChanges = [...added, ...updatedList];
            const options = await host.buildOptions('batch-save', {}, allChanges, {});
            await host.fetch('batch-save', options);
        } else {
            // --- 场景 B: 分步提交 (带延迟感) ---
            if (added.length > 0) {
                const options = await host.buildOptions('create', {}, added, {});
                await host.fetch('create', options);
            }
            if (updatedList.length > 0) {
                const options = await host.buildOptions('update', {}, updatedList, {});
                await host.fetch('update', options);
            }
        }

        // 提交成功后的清理工作
        // 注意：这里需要根据你的实现决定是 reset 还是 refresh
        host.emit('saved');
    }
}
