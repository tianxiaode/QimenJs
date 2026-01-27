import { AbilityBase } from '../../composable';
import { IBaseEntityManager, IExposeResult } from '../../types';

/**
 * LocalUpdateAbility - 本地更新能力
 * 
 * 提供在本地更新实体的能力，包括合并新数据和更新UI状态
 * 
 * @template T 实体类型
 * @template TCriteria 搜索条件类型
 */
export class LocalUpdateAbility<T, TCriteria> extends AbilityBase<IBaseEntityManager> {
    /**
     * 影子存储：用于存放已修改但未提交的实体数据片段。
     * 键是实体的唯一ID，值是该实体发生变更的字段集合 (Partial<T>)。
     */
    private dirtyMap = new Map<any, Partial<T>>();

    /**
     * 快照存储：用于存放被修改实体的原始完整记录。
     * 键是实体的唯一ID，值是该实体在被修改前的完整状态 (T)。
     * 此快照用于支持撤销(undo)操作。
     */
    private originalMap = new Map<any, T>();

    /**
     * 暴露更新实体的方法
     * 
     * @returns 包含update方法的对象，用于更新指定的实体记录
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 更新指定的实体记录
             * 
             * @param record 要更新的实体记录
             * @param patch 要更新的数据
             * @returns 更新后的实体记录
             */
            update: (record: T, patch: Partial<T>): T => {
                const idKey = host.schemaKeys.id;
                const id = (record as any)[idKey];

                // 查找要更新的记录
                const targetIdx = host.state.items.findIndex((item: T) => {
                    const itemId = (item as any)[idKey];
                    return itemId === id;
                });

                if (targetIdx !== -1) {
                    // 合并数据
                    const updatedRecord = {
                        ...host.state.items[targetIdx],
                        ...patch,
                        _isLocal: true // 保留本地标识
                    };

                    // 更新状态中的记录
                    host.state.items[targetIdx] = updatedRecord;
                    host.state.item = updatedRecord;

                    // 发出更新事件
                    host.emit('updated', updatedRecord);

                    return updatedRecord;
                }

                return record;
            }
        };
    }

    public onDispose(): void {
        this.host.clearDirtyStatus();
    }
}
