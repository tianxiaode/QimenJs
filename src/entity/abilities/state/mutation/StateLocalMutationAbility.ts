import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import type { IBaseEntityState, IDeletionPlan, ILocalChangeSet } from '@/entity/types';

export class StateLocalMutationAbility extends AbilityBase {
    // 内部维护变更集
    private _changes?: ILocalChangeSet;
    private _deleteSnapshots = new Map<string | number, any>();

    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            hasChanges: { get: () => proxy.self._changes !== undefined && (proxy.self._changes.added.length > 0 || proxy.self._changes.updated.size > 0 || proxy.self._changes.deleted.length > 0) },
            changes: { get: () => (proxy.self._changes ?? proxy.self.createEmptyChanges()) },

            /**
             * 新增项
             * 注意：方法使用普通函数，this 会被 bind(host) 绑定为 State 实例
             */
            addItem: async function(this: IBaseEntityState, item: any) {
                const idField = this.schema.idField || 'id';
                const idType = this.schema.idType || 'string';
                const tempId = idType === 'number' ? -Math.abs(Date.now()) : crypto.randomUUID();
                item.tempId = tempId;
                item.isNew = true;
                proxy.self._changes ??= proxy.self.createEmptyChanges();
                proxy.self._changes.added.push(item);
                (this as any).sourceData.set(item[idField] || item.tempId, item);
                await proxy.self.commitChange(this);
            },

            /**
             * 更新项
             */
            updateItem: async function(this: IBaseEntityState, item: any) {
                const idField = this.schema.idField || 'id';
                const key = item[idField] || item.tempId;
                (this as any).sourceData.set(key, { ...item });

                const id = item[idField];
                proxy.self._changes ??= proxy.self.createEmptyChanges();
                const isNew = proxy.self._changes.added.some(
                    (i: any) => i[idField] === id || i.tempId === item.tempId
                );

                if (!isNew && id) {
                    proxy.self._changes.updated.set(id, { ...item });
                }
                await proxy.self.commitChange(this);
            },

            updateData: async function(this: IBaseEntityState, result: any[]) {
                const idField = this.schema.idField || 'id';
                proxy.self._changes = proxy.self.createEmptyChanges();
                result.forEach((item: any) => {
                    const id = item[idField];
                    const tempId = item.tempId;
                    if (tempId && (this as any).sourceData.has(tempId)) {
                        (this as any).sourceData.delete(tempId);
                    }
                    (this as any).sourceData.set(id, item);
                });
                await proxy.self.commitChange(this);
            },

            /**
             * 软删除
             */
            softDelete: async function(this: IBaseEntityState, plan: IDeletionPlan) {
                const idField = this.schema.idField || 'id';
                const { localOnly, persistent } = plan;

                // 从实体对象中提取 ID
                const localIds = localOnly.map((item: any) => typeof item === 'object' ? item[idField] : item);
                const persistentIds = persistent.map((item: any) => typeof item === 'object' ? item[idField] : item);
                const allIds = [...localIds, ...persistentIds];

                // 保存所有待删除项的快照（用于回滚）
                allIds.forEach((id: any) => {
                    const sourceData = (this as any).sourceData;
                    const item = Array.from(sourceData.values()).find((i: any) => i[idField] === id);
                    if (item) {
                        proxy.self._deleteSnapshots.set(id, { ...item });
                    }
                });

                if (localIds.length > 0) {
                    proxy.self._changes ??= proxy.self.createEmptyChanges();
                    const localSet = new Set(localIds);
                    proxy.self._changes.added = proxy.self._changes.added.filter(
                        (item: any) => !localSet.has(item[idField])
                    );
                    proxy.self._changes.deleted.push(...localIds);
                }

                // 将持久化删除的 ID 也加入 changes.deleted
                if (persistentIds.length > 0) {
                    proxy.self._changes ??= proxy.self.createEmptyChanges();
                    proxy.self._changes.deleted.push(...persistentIds);
                }

                await proxy.self.deleteFromSource(this, allIds);
            },

            getDeletionPlan: function(this: IBaseEntityState, ids: (string | number)[]): IDeletionPlan {
                const idField = this.schema.idField || 'id';
                const plan: IDeletionPlan = { localOnly: [], persistent: [] };

                const addedIds = proxy.self._changes ? new Set(proxy.self._changes.added.map((item: any) => item[idField])) : new Set();

                ids.forEach(id => {
                    if (addedIds.has(id)) {
                        plan.localOnly.push(id);
                    } else {
                        plan.persistent.push(id);
                    }
                });

                return plan;
            },

            confirmDelete: async function(this: IBaseEntityState) {
                proxy.self._deleteSnapshots.clear();
                if (proxy.self._changes) {
                    proxy.self._changes.deleted.length = 0;
                }
                await proxy.self.commitChange(this);
            },

            rollbackDelete: async function(this: IBaseEntityState) {
                if (proxy.self._deleteSnapshots.size === 0 && (!proxy.self._changes || proxy.self._changes.deleted.length === 0)) return;

                proxy.self._deleteSnapshots.forEach((item: any, id: any) => {
                    (this as any).sourceData.set(id, item);
                });

                proxy.self._deleteSnapshots.clear();
                if (proxy.self._changes) {
                    proxy.self._changes.deleted.length = 0;
                }
                await proxy.self.commitChange(this);
            },

            /**
             * 重置所有变更
             */
            clearChanges: function() {
                proxy.self._changes = proxy.self.createEmptyChanges();
            },
        };
    }

    private async commitChange(host: IBaseEntityState) {
        (host as any).refreshView?.();
        await (host as any).setCache?.((host as any).sourceData);
    }

    protected createEmptyChanges(): ILocalChangeSet {
        return {
            added: [],
            updated: new Map(),
            deleted: [],
        };
    }

    private async deleteFromSource(host: IBaseEntityState, ids: (string | number)[]): Promise<void> {
        ids.forEach(key => (host as any).sourceData.delete(key));
        await this.commitChange(host);
    }

    protected onDispose() {
        if (this._changes) {
            this._changes.added.length = 0;
            this._changes.updated.clear();
            this._changes.deleted.length = 0;
            this._changes = undefined;
        }
        this._deleteSnapshots.clear();
    }
}
