import type { AbilityDefinition } from '@/composable';

/**
 * FlatLocalMutationAbility - 平铺本地变更能力
 * 
 * 提供本地新增、更新、切换和批量保存的能力。
 * 数据先进入本地缓冲区，save 时同步到远程。
 * 
 * this 指向宿主（Manager），this.state 可直接访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 */
export const FlatLocalMutationAbility: AbilityDefinition = {
    create(item: any) {
        const { state } = this;
        state.addItem(item);
        this.emit('created', item);
        return item;
    },

    update(item: any) {
        const { state } = this;
        state.updateItem(item);
        this.emit('updated', item);
        return item;
    },

    toggle(item: any, field: string) {
        const { state } = this;
        const oldValue = item[field];
        item[field] = !oldValue;
        state.updateItem(item);
        this.emit('toggled', item, field, oldValue);
    },

    save(isBatch: boolean = false) {
        return this.debounce('save', () => this._internalSave(isBatch), 500, false)();
    },

    async _internalSave(isBatch: boolean = false) {
        const { state } = this;
        if (!state.hasChanges) return;

        const { added, updated } = state.changes;
        const updatedList = Array.from(updated.values());

        if (isBatch) {
            const allChanges = [...added, ...updatedList];
            const options = await this.buildOptions('batch-save', {}, allChanges, {});
            await this.fetch('batch-save', options);
        } else {
            if (added.length > 0) {
                const options = await this.buildOptions('create', {}, added, {});
                await this.fetch('create', options);
            }
            if (updatedList.length > 0) {
                const options = await this.buildOptions('update', {}, updatedList, {});
                await this.fetch('update', options);
            }
        }

        this.emit('saved');
    },
};
