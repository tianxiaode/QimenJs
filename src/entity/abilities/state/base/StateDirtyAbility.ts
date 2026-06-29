import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import type { IBaseEntityState } from '@/entity/types';

export class StateDirtyAbility extends AbilityBase {
    private _snapshots = new Map<string, any>();

    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            isDirty: function(this: IBaseEntityState, item?: any): boolean {
                const idField = this.schema.idField || 'id';
                if (!item) return proxy.self._snapshots.size > 0;
                const id = item[idField];
                const snapshot: any = proxy.self._snapshots.get(id);
                if (snapshot === undefined) return false;
                return (Object.keys(snapshot) as Array<keyof any>).some(key => {
                    if (key === 'updatedAt' || key === 'version') return false;

                    const val1 = snapshot[key];
                    const val2 = item[key];

                    if (typeof val1 !== 'object' || val1 === null) {
                        return val1 !== val2;
                    }

                    return JSON.stringify(val1) !== JSON.stringify(val2);
                });
            },

            startEdit: function(this: IBaseEntityState, item: any) {
                const idField = this.schema.idField || 'id';
                const id = item[idField];
                if (!proxy.self._snapshots.has(id)) {
                    proxy.self._snapshots.set(id, { ...item });
                }
            },

            submitEdit: function(this: IBaseEntityState, item: any) {
                const idField = this.schema.idField || 'id';
                const id = item[idField];
                proxy.self._snapshots.delete(id);
            },

            cancelEdit: function(this: IBaseEntityState, item: any) {
                const idField = this.schema.idField || 'id';
                const id = item[idField];
                const snapshot = proxy.self._snapshots.get(id);
                if (snapshot) {
                    Object.assign(item, snapshot);
                    proxy.self._snapshots.delete(id);
                }
            },

            rollbackAll: function() {
                proxy.self._snapshots.clear();
            },
        };
    }

    protected onDispose(): void {
        this._snapshots.clear();
    }
}
