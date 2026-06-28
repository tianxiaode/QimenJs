import { AbilityBase, type IExposeResult } from '@/composable';
import type { IBaseEntityState, IDeletionPlan, ILocalChangeSet } from '@/entity/types';

export class StateLocalMutationAbility extends AbilityBase {
    // 内部维护变更集
    private _changes: ILocalChangeSet = this.createEmptyChanges();
    private _deleteSnapshots = new Map<string | number, any>();

    protected expose(): IExposeResult {
        return {
            hasChanges: { get: () => this._changes.added.length > 0 || this._changes.updated.size > 0 },
            // 暴露变更集只读引用
            changes: { get: () => this._changes },

            /**
             * 新增项
             */
            addItem: async (item: any) => {
                const host = this.host as IBaseEntityState;
                const idField = host.schema.idField || 'id';
                const idType = host.schema.idType || 'string';
                const tempId = idType === 'number' ? -Math.abs(Date.now()) : crypto.randomUUID();
                item.tempId = tempId; // 标记临时id，用于后续删除
                item.isNew = true; // 标记为新增
                this._changes.added.push(item);
                (host as any).sourceData.set(this.getMapKey(item), item);
                await this.commitChange();
            },

            /**
             * 更新项
             */
            updateItem: async (item: any) => {
                const host = this.host as IBaseEntityState;
                const idField = host.schema.idField || 'id';
                const key = this.getMapKey(item);
                // 1. 更新 sourceData (Map 直接覆盖)
                (host as any).sourceData.set(key, { ...item });

                // 2. 记录到变更集
                const id = item[idField];
                const isNew = this._changes.added.some(
                    (i: any) => i[idField] === id || i.tempId === item.tempId
                );

                if (!isNew && id) {
                    this._changes.updated.set(id, { ...item });
                }
                await this.commitChange();
            },

            updateData: async (result: any[]) => {
                const host = this.host as IBaseEntityState;
                const idField = host.schema.idField || 'id';
                this._changes = this.createEmptyChanges();
                result.forEach((item: any) => {
                    const id = item[idField];
                    const tempId = item.tempId;
                    const exists =
                        (host as any).sourceData.has(id) || (tempId && (host as any).sourceData.has(tempId));
                    if (tempId && (host as any).sourceData.has(tempId)) {
                        // 关键：如果是从临时项转正，删除旧的 tempId Key
                        (host as any).sourceData.delete(tempId);
                    }
                    (host as any).sourceData.set(id, item);
                });
                await this.commitChange();
            },

            /**
             * 软删除：先从视觉和源数据中移除，存入快照
             */
            softDelete: async (plan: IDeletionPlan) => {
                const host = this.host as IBaseEntityState;
                const idField = host.schema.idField || 'id';
                const { localOnly, persistent } = plan;

                // 1. 处理新增项：直接彻底删除（因为没有远程开销，失败概率极低）
                if (localOnly.length > 0) {
                    const localSet = new Set(localOnly);
                    this._changes.added = this._changes.added.filter(
                        item => !localSet.has(item[idField])
                    );
                }

                // 2. 处理持久化项：记录快照并暂时移除
                persistent.forEach(id => {
                    const sourceData = (host as any).sourceData;
                    const item = Array.from(sourceData.values()).find((i: any) => i[idField] === id);
                    if (item) {
                        this._deleteSnapshots.set(id, { ...item }); // 存入回收站
                        // 如果有待更新的补丁，也顺便存一份
                        if (this._changes.updated.has(id)) {
                            // 可选：记录 updated 状态
                        }
                    }
                });

                // 3. 从内存和视图中移除
                await this.delete([...localOnly, ...persistent]);
            },

            getDeletionPlan: (ids: (string | number)[]) => {
                const host = this.host as IBaseEntityState;
                const idField = host.schema.idField || 'id';
                const plan: IDeletionPlan = { localOnly: [], persistent: [] };

                // 获取当前新增缓冲区的 ID 集合
                const addedIds = new Set(this._changes.added.map(item => item[idField]));

                ids.forEach(id => {
                    if (addedIds.has(id)) {
                        plan.localOnly.push(id);
                    } else {
                        plan.persistent.push(id);
                    }
                });

                return plan;
            },

            confirmDelete: async () => {
                this._deleteSnapshots.clear();
                await this.commitChange();
            },

            rollbackDelete: async () => {
                if (this._deleteSnapshots.size === 0) return;

                this._deleteSnapshots.forEach((item, id) => {
                    const host = this.host as IBaseEntityState;
                    (host as any).sourceData.set(id, item);
                    // 如果原本就在 updated 列表里，这里还可以根据需求恢复状态
                });

                this._deleteSnapshots.clear();
                await this.commitChange();
            },

            /**
             * 重置所有变更
             */
            clearChanges: () => {
                this._changes = this.createEmptyChanges();
            },
        };
    }

    private async commitChange() {
        const host = this.host as IBaseEntityState;
        // 1. 触发视图刷新
        (host as any).refreshView?.();
        // 2. 自动同步到缓存
        await (host as any).setCache?.((host as any).sourceData);
    }

    private getMapKey(item: any): string | number {
        const host = this.host as IBaseEntityState;
        const idField = host.schema.idField || 'id';
        // 优先取正式 ID，没有则取 tempId，再没有取随机生成的唯一标识
        return item[idField] || item.tempId;
    }

    protected createEmptyChanges(): ILocalChangeSet {
        return {
            added: [],
            updated: new Map(),
            deleted: [],
        };
    }

    protected async delete(id: string | number | (string | number)[]): Promise<void> {
        const host = this.host as IBaseEntityState;
        const ids = Array.isArray(id) ? id : [id];

        // Map 的删除极其简单高效
        ids.forEach(key => (host as any).sourceData.delete(key));

        await this.commitChange();
    }

    protected onDispose() {
        this._changes.added = null as any;
        this._changes.updated.clear();
        this._changes = null as any;
        this._deleteSnapshots.clear();
        this._deleteSnapshots = null as any;
    }
}
