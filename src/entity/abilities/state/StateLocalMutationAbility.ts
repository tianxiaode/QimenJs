import {
    IBaseEntityState,
    IDeletionPlan,
    IEntity,
    IExposeResult,
    ILocalChangeSet,
    SearchParams,
} from '../../types';
import { AbilityBase } from '../../composable';

export class StateLocalMutationAbility<
    T extends IEntity,
    TSearch extends SearchParams,
> extends AbilityBase<IBaseEntityState<T, TSearch>> {
    // 内部维护变更集
    private _changes: ILocalChangeSet<T> = this.createEmptyChanges();
    private _deleteSnapshots = new Map<string | number, T>();

    protected expose(): IExposeResult {
        const host: any = this.host;
        const idField = host.idField;

        return {
            hasChanges: { get: () => this._changes.added.length > 0 || this._changes.updated.size > 0 },
            // 暴露变更集只读引用
            changes: { get: () => this._changes },

            /**
             * 新增项
             */
            addItem: async (item: T) => {
                const idType = host.idType || 'string';
                const tempId = idType === 'number' ? -Math.abs(Date.now()) : crypto.randomUUID();
                (item as any).tempId = tempId; // 标记临时id，用于后续删除
                (item as any).isNew = true; // 标记为新增
                this._changes.added.push(item);
                host.sourceData.set(this.getMapKey(item), item);
                await this.commitChange();
            },

            /**
             * 更新项
             */
            updateItem: async (item: T) => {
                const key = this.getMapKey(item);
                // 1. 更新 sourceData (Map 直接覆盖)
                host.sourceData.set(key, { ...item });

                // 2. 记录到变更集
                const id = (item as any)[idField];
                const isNew = this._changes.added.some(
                    (i: any) => i[idField] === id || (i as any).tempId === (item as any).tempId
                );

                if (!isNew && id) {
                    this._changes.updated.set(id, { ...item });
                }
                await this.commitChange();
            },

            updateData: async (result: T[]) => {
                this._changes = this.createEmptyChanges();
                result.forEach((item: any) => {
                    const id = item[idField];
                    const tempId = item.tempId;
                    const exists =
                        host.sourceData.has(id) || (tempId && host.sourceData.has(tempId));
                    if (tempId && host.sourceData.has(tempId)) {
                        // 关键：如果是从临时项转正，删除旧的 tempId Key
                        host.sourceData.delete(tempId);
                    }
                    host.sourceData.set(id, item);
                });
                await this.commitChange();
            },

            /**
             * 软删除：先从视觉和源数据中移除，存入快照
             */
            softDelete: async (plan: IDeletionPlan) => {
                const { localOnly, persistent } = plan;

                // 1. 处理新增项：直接彻底删除（因为没有远程开销，失败概率极低）
                if (localOnly.length > 0) {
                    const localSet = new Set(localOnly);
                    this._changes.added = this._changes.added.filter(
                        item => !localSet.has((item as any)[idField])
                    );
                }

                // 2. 处理持久化项：记录快照并暂时移除
                persistent.forEach(id => {
                    const item = host.sourceData.find((i: any) => i[idField] === id);
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
                const idField = host.idField;
                const plan: IDeletionPlan = { localOnly: [], persistent: [] };

                // 获取当前新增缓冲区的 ID 集合
                const addedIds = new Set(this._changes.added.map(item => (item as any)[idField]));

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
                    host.sourceData.set(id, item);
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
        const host: any = this.host;
        // 1. 触发视图刷新
        host.refreshView?.();
        // 2. 自动同步到缓存
        await host.setCache?.(host.sourceData);
    }

    private getMapKey(item: T): string | number {
        const host: any = this.host;
        // 优先取正式 ID，没有则取 tempId，再没有取随机生成的唯一标识
        return (item as any)[host.idField] || (item as any).tempId;
    }

    protected createEmptyChanges(): ILocalChangeSet<T> {
        return {
            added: [],
            updated: new Map(),
        };
    }

    protected async delete(id: string | number | (string | number)[]): Promise<void> {
        const host: any = this.host;
        const ids = Array.isArray(id) ? id : [id];

        // Map 的删除极其简单高效
        ids.forEach(key => host.sourceData.delete(key));

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
