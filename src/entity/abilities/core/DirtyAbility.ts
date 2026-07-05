import type { AbilityDefinition } from '@/composable';

/**
 * DirtyAbility - 脏检查能力
 *
 * 为宿主提供脏检查（dirty check）功能，通过快照对比检测数据变更。
 * this 指向宿主（Manager），this.schema 可直接访问。
 * 私有状态 _snapshots 通过 abilityState 管理，宿主 dispose 时自动清空。
 */
export const DirtyAbility: AbilityDefinition = {
    isDirty(item?: any): boolean {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        if (!item) return snapshots.size > 0;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        const snapshot: any = snapshots.get(id);
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

    startEdit(item: any) {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        if (!snapshots.has(id)) {
            snapshots.set(id, { ...item });
        }
    },

    submitEdit(item: any) {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        snapshots.delete(id);
    },

    cancelEdit(item: any) {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        const snapshot = snapshots.get(id);
        if (snapshot) {
            Object.assign(item, snapshot);
            snapshots.delete(id);
        }
    },

    rollbackAll() {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        snapshots.clear();
    },
};
