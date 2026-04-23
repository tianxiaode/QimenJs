import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';

export class StateDirtyAbility<T extends IEntity, TSearch extends SearchParams> extends AbilityBase<
    IBaseEntityState<T, TSearch>
> {
    // 存储原始数据的快照，Key 为实体 ID
    private _snapshots = new Map<string, any>(); // 存 JSON 字符串最保险

    protected expose(): IExposeResult {
        const { host } = this;
        const idField = host.schema.idField || 'id';

        return {
            /**
             * 检查某个对象或整个 State 是否有未保存的修改
             */
            isDirty: (item?: T) => {
                if (!item) return this._snapshots.size > 0;
                const id = (item as any)[idField];
                const snapshot: any = this._snapshots.get(id);
                // 如果没有快照，说明没进入编辑状态，不认为是脏的
                if (snapshot === undefined) return false;
                return (Object.keys(snapshot) as Array<keyof T>).some(key => {
                    // 排除掉干扰项
                    if (key === 'updatedAt' || key === 'version') return false;

                    const val1 = snapshot[key];
                    const val2 = item[key];

                    // 基础类型直接比对
                    if (typeof val1 !== 'object' || val1 === null) {
                        return val1 !== val2;
                    }

                    // 复杂类型使用 JSON 比对
                    return JSON.stringify(val1) !== JSON.stringify(val2);
                });
            },

            /**
             * 开始编辑：记录原始快照
             */
            startEdit: (item: T) => {
                const id = (item as any)[idField];
                if (!this._snapshots.has(id)) {
                    this._snapshots.set(id, { ...item });
                }
            },

            /**
             * 结束编辑（确认）：丢弃快照
             */
            submitEdit: (item: T) => {
                const id = (item as any)[idField];
                this._snapshots.delete(id);
            },

            /**
             * 结束编辑（撤销/回滚）：恢复原始值
             */
            cancelEdit: (item: T) => {
                const id = (item as any)[idField];
                const snapshot = this._snapshots.get(id);
                if (snapshot) {
                    Object.assign(item, snapshot);
                    this._snapshots.delete(id);
                }
            },

            /**
             * 全局回滚：取消所有正在进行的编辑
             */
            rollbackAll: () => {
                // 遍历快照恢复数据，此处略
                this._snapshots.clear();
            },
        };
    }

    protected onDispose(): void {
        this._snapshots.clear();
    }
}
