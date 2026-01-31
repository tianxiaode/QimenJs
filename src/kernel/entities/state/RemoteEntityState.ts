import { BaseEntityState } from './BaseEntityState';
import { IEntity, IRemoteEntityState, SearchParams } from '../../types';

export abstract class RemoteEntityState<T extends IEntity, TSearch extends SearchParams>
    extends BaseEntityState<T, TSearch>
    implements IRemoteEntityState<T, TSearch>
{
    snapshot: T | null = null;

    isDirty(currentItem: T): boolean {
        if (!this.snapshot || !currentItem) return false;

        const keys = Object.keys(this.snapshot) as Array<keyof T>;

        return keys.some(key => {
            if (key === 'updatedAt' || key === 'version') return false;

            const val1 = this.snapshot![key];
            const val2 = currentItem[key];

            // 基础类型直接比对
            if (typeof val1 !== 'object' || val1 === null) {
                return val1 !== val2;
            }

            // 对象/数组使用简单的 JSON 比对（或者引入 lodash.isEqual）
            return JSON.stringify(val1) !== JSON.stringify(val2);
        });
    }

    edit(item: T): void {
        this.snapshot = { ...item };
    }

    rollback(): T | null {
        return this.snapshot ? { ...this.snapshot } : null;
    }

    dispose(): void {
        this.snapshot = null;
        super.dispose();
    }
}
