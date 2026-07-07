import type { AbilityDefinition } from '@/composable';
import { ENTITY_CRUD_EVENTS } from '@/events';

/**
 * FlatLocalMutationAbility - 平铺本地变更能力
 *
 * 提供本地新增、更新、切换和批量保存的能力。
 * 数据先进入本地缓冲区，save 时同步到远程。
 *
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 */
export const FlatLocalMutationAbility: AbilityDefinition = {
    create(item: any) {
        this.addItem(item);
        this.emit(ENTITY_CRUD_EVENTS.CREATED, item);
        return item;
    },

    update(item: any) {
        this.updateItem(item);
        this.emit(ENTITY_CRUD_EVENTS.UPDATED, item);
        return item;
    },

    toggle(item: any, field: string) {
        const idField = this.idField;
        const id = item[idField];
        const oldValue = item[field];
        item[field] = !oldValue;
        this.updateItem(item);
        this.emit(ENTITY_CRUD_EVENTS.TOGGLED, { id, item, field, oldValue });
    },

    save(isBatch: boolean = false) {
        return this.debounce('save', () => this._internalSave(isBatch), 500, false)();
    },

    async _internalSave(isBatch: boolean = false) {
        if (!this.hasChanges) return;

        const { added, updated } = this.changes;
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

        this.emit(ENTITY_CRUD_EVENTS.SAVED);
    },
};
