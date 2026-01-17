import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

export class LocalUpdateAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    // 影子存储：ID -> 变化后的数据片段
    private dirtyMap = new Map<any, Partial<T>>();
    // 快照存储：ID -> 修改前的完整原始记录
    private originalMap = new Map<any, T>();

    protected expose(): IExposeResult {
        const { host } = this;

        return {
            update: (patch: Partial<T>): void => {
                const idKey = host.schemaKeys.id;
                const id = (patch as any)[idKey];
                const items = host.state.items || [];
                const index = items.findIndex((i: any) => i[idKey] === id);
                if (index === -1) return;

                const item = items[index];

                if (!this.originalMap.has(id)) {
                    this.originalMap.set(id, JSON.parse(JSON.stringify(item)));
                }

                const currentChanges = this.dirtyMap.get(id) || {};
                const newItem = { ...currentChanges, ...patch };
                this.dirtyMap.set(id, newItem);

                const newItems = [...items];
                newItems[index] = { ...item, ...patch };
                host.state.items = newItems;

                // 同步当前活跃项
                if (host.state.item?.[idKey] === id) {
                    host.state.item = newItems[index];
                }

                host.emit('updated', newItem);
            },

            /**
             * 获取所有已修改的记录及其变更内容
             */
            getDirty: (): Array<{ id: any; changes: Partial<T>; original: T }> => {
                const results: any[] = [];
                this.dirtyMap.forEach((changes, id) => {
                    results.push({
                        id,
                        changes,
                        original: this.originalMap.get(id),
                    });
                });
                return results;
            },

            /**
             * 撤销特定记录的修改
             */
            undoLocalUpdate: (id: any): void => {
                const original = this.originalMap.get(id);
                if (!original) return;

                const idKey = host.schemaKeys.id;
                const items = host.state.items || [];
                const index = items.findIndex((i: any) => i[idKey] === id);

                if (index !== -1) {
                    const newItems = [...items];
                    newItems[index] = original;
                    host.state.items = newItems;

                    this.dirtyMap.delete(id);
                    this.originalMap.delete(id);
                }
            },

            /**
             * 提交后清空状态
             */
            clearDirtyStatus: (): void => {
                this.dirtyMap.clear();
                this.originalMap.clear();
            },
        };
    }

    public onDispose(): void {
        this.host.clearDirtyStatus();
    }
}
