import type { AbilityDefinition } from '@/composable';
import type { IDeletionPlan, ILocalChangeSet } from '@/entity/types';

/**
 * LocalMutationAbility - 本地变更集能力
 *
 * 为宿主提供本地数据变更管理功能（新增/更新/删除/回滚）。
 * this 指向宿主（Manager），this.schema/sourceData 可直接访问。
 * 私有状态 _changes/_deleteSnapshots 通过 abilityState 管理。
 * 防抖 refreshView 通过 this.debounce() 管理。
 */
export const LocalMutationAbility= {
    hasChanges: {
        get() {
            const changes = this.abilityState('StateLocalMutation:changes') as
                | ILocalChangeSet
                | undefined;
            return (
                changes !== undefined &&
                (changes.added.length > 0 || changes.updated.size > 0 || changes.deleted.length > 0)
            );
        },
    },

    changes: {
        get() {
            return this.abilityState('StateLocalMutation:changes') ?? this._createEmptyChanges();
        },
    },

    async addItem(item: any) {
        const idField = this.schema.idField || 'id';
        const idType = this.schema.idType || 'string';
        const tempId = idType === 'number' ? -Math.abs(Date.now()) : crypto.randomUUID();
        item.tempId = tempId;
        item.isNew = true;
        const changes = this._getOrCreateChanges();
        changes.added.push(item);
        this.sourceData.set(item[idField] || item.tempId, item);
        await this._commitChange();
    },

    async updateItem(item: any) {
        const idField = this.schema.idField || 'id';
        const key = item[idField] || item.tempId;
        this.sourceData.set(key, { ...item });

        const id = item[idField];
        const changes = this._getOrCreateChanges();
        const isNew = changes.added.some((i: any) => i[idField] === id || i.tempId === item.tempId);

        if (!isNew && id) {
            changes.updated.set(id, { ...item });
        }
        await this._commitChange();
    },

    async updateData(result: any[]) {
        const idField = this.schema.idField || 'id';
        this.setAbilityState('StateLocalMutation:changes', this._createEmptyChanges());
        result.forEach((item: any) => {
            const id = item[idField];
            const tempId = item.tempId;
            if (tempId && this.sourceData.has(tempId)) {
                this.sourceData.delete(tempId);
            }
            this.sourceData.set(id, item);
        });
        await this._commitChange();
    },

    async softDelete(plan: IDeletionPlan) {
        const idField = this.schema.idField || 'id';
        const { localOnly, persistent } = plan;

        const localIds = localOnly.map((item: any) =>
            typeof item === 'object' ? item[idField] : item
        );
        const persistentIds = persistent.map((item: any) =>
            typeof item === 'object' ? item[idField] : item
        );
        const allIds = [...localIds, ...persistentIds];

        // 保存所有待删除项的快照（用于回滚）
        const deleteSnapshots = this._getOrCreateDeleteSnapshots();
        allIds.forEach((id: any) => {
            const item = Array.from(this.sourceData.values()).find((i: any) => i[idField] === id);
            if (item) {
                deleteSnapshots.set(id, { ...item });
            }
        });

        if (localIds.length > 0) {
            const changes = this._getOrCreateChanges();
            const localSet = new Set(localIds);
            changes.added = changes.added.filter((item: any) => !localSet.has(item[idField]));
            changes.deleted.push(...localIds);
        }

        if (persistentIds.length > 0) {
            const changes = this._getOrCreateChanges();
            changes.deleted.push(...persistentIds);
        }

        await this._deleteFromSource(allIds);
    },

    getDeletionPlan(ids: (string | number)[]): IDeletionPlan {
        const idField = this.schema.idField || 'id';
        const plan: IDeletionPlan = { localOnly: [], persistent: [] };

        const changes = this.abilityState('StateLocalMutation:changes') as
            | ILocalChangeSet
            | undefined;
        const addedIds = changes
            ? new Set(changes.added.map((item: any) => item[idField]))
            : new Set();

        ids.forEach(id => {
            if (addedIds.has(id)) {
                plan.localOnly.push(id);
            } else {
                plan.persistent.push(id);
            }
        });

        return plan;
    },

    async confirmDelete() {
        const deleteSnapshots = this._getOrCreateDeleteSnapshots();
        deleteSnapshots.clear();
        const changes = this.abilityState('StateLocalMutation:changes') as
            | ILocalChangeSet
            | undefined;
        if (changes) {
            changes.deleted.length = 0;
        }
        await this._commitChange();
    },

    async rollbackDelete() {
        const deleteSnapshots = this._getOrCreateDeleteSnapshots();
        const changes = this.abilityState('StateLocalMutation:changes') as
            | ILocalChangeSet
            | undefined;
        if (deleteSnapshots.size === 0 && (!changes || changes.deleted.length === 0)) return;

        deleteSnapshots.forEach((item: any, id: any) => {
            this.sourceData.set(id, item);
        });

        deleteSnapshots.clear();
        if (changes) {
            changes.deleted.length = 0;
        }
        await this._commitChange();
    },

    clearChanges() {
        this.setAbilityState('StateLocalMutation:changes', this._createEmptyChanges());
    },

    // ---- 内部辅助方法 ----

    _getOrCreateChanges(): ILocalChangeSet {
        let changes = this.abilityState('StateLocalMutation:changes') as
            | ILocalChangeSet
            | undefined;
        if (!changes) {
            changes = this._createEmptyChanges();
            this.setAbilityState('StateLocalMutation:changes', changes);
        }
        return changes!;
    },

    _getOrCreateDeleteSnapshots(): Map<string | number, any> {
        let snapshots = this.abilityState('StateLocalMutation:deleteSnapshots') as
            | Map<string | number, any>
            | undefined;
        if (!snapshots) {
            snapshots = new Map<string | number, any>();
            this.setAbilityState('StateLocalMutation:deleteSnapshots', snapshots);
        }
        return snapshots;
    },

    _createEmptyChanges(): ILocalChangeSet {
        return {
            added: [],
            updated: new Map(),
            deleted: [],
        };
    },

    async _commitChange() {
        // 缓存立即更新（保证数据一致性）
        await this.setCache?.(this.sourceData);
        // 视图刷新防抖（高频操作时合并渲染）
        this.debounce('refreshView', () => this.refreshView?.(), 50)();
    },

    async _deleteFromSource(ids: (string | number)[]): Promise<void> {
        ids.forEach(key => this.sourceData.delete(key));
        await this._commitChange();
    },
} satisfies AbilityDefinition;
