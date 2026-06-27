import { DebounceAbilityBase, type IExposeResult } from '@/composable';

/**
 * FlatLocalMutationAbility - 平铺本地变更能力
 * 
 * 提供本地新增、更新、切换和批量保存的能力。
 * 数据先进入本地缓冲区，save 时同步到远程。
 */
export class FlatLocalMutationAbility extends DebounceAbilityBase {
    protected expose(): IExposeResult {
        const debouncedSave = this.getDebouncedAction('save', (isBatch: boolean) => this.internalSave(isBatch), 500, false);

        return {
            create: (item: any) => {
                const host = this.host;
                const { state } = host;
                state.addItem(item);
                host.emit('created', item);
                return item;
            },

            update: (item: any) => {
                const host = this.host;
                const { state } = host;
                state.updateItem(item);
                host.emit('updated', item);
                return item;
            },

            toggle: (item: any, field: string) => {
                const host = this.host;
                const { state } = host;
                const oldValue = item[field];
                item[field] = !oldValue;
                state.updateItem(item);
                host.emit('toggled', item, field, oldValue);
            },

            save: (isBatch: boolean = false) => debouncedSave(isBatch),
        };
    }

    private async internalSave(isBatch: boolean = false) {
        const host = this.host;
        const { state } = host;
        if (!state.hasChanges) return;

        const { added, updated } = state.changes;
        const updatedList = Array.from(updated.values());

        if (isBatch) {
            const allChanges = [...added, ...updatedList];
            const options = await host.buildOptions('batch-save', {}, allChanges, {});
            await host.fetch('batch-save', options);
        } else {
            if (added.length > 0) {
                const options = await host.buildOptions('create', {}, added, {});
                await host.fetch('create', options);
            }
            if (updatedList.length > 0) {
                const options = await host.buildOptions('update', {}, updatedList, {});
                await host.fetch('update', options);
            }
        }

        host.emit('saved');
    }
}
