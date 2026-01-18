import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

/**
 * LocalDeleteAbility - 本地删除能力
 * 
 * 提供在客户端本地删除实体的能力，支持临时删除操作。
 * 主要功能包括：
 * - 从状态中物理移除指定ID的实体
 * - 记录被删除的正式ID（用于后续同步）
 * - 提供清除删除状态的方法
 * 
 * @template T - 实体类型
 * @template TCriteria - 搜索字段类型
 */
export class LocalDeleteAbility<T, TCriteria> extends AbilityBase<IEntityManagerBase> {
    // 影子状态：记录被删除的正式 ID
    private deletedIds = new Set<any>();

    /**
     * 暴露本地删除相关的方法
     * 
     * @returns 返回包含 delete、getDeletedIds 和 clearDeletedStatus 方法的对象
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 本地删除：标记删除并从列表移除
             * 
             * @param target - 要删除的一个或多个实体ID
             * @returns void
             */
            delete: (target: any | any[]): void => {
                const ids = Array.isArray(target) ? target : [target];
                const idType = (host as any).schemaIdType;

                ids.forEach(id => {
                    // 只有正式 ID (非负数/非 tmp_) 才需要记录到影子状态
                    const isLocal = idType === 'number' ? id < 0 : id.toString().startsWith('tmp_');
                    if (!isLocal) {
                        this.deletedIds.add(id);
                    }
                    this.physicallyRemove(id);
                });

                host.emit('local-deleted', ids);
            },

            /** 
             * 获取所有被标记删除的正式 ID 列表
             * 
             * @returns 被删除的正式ID数组
             */
            getDeletedIds: () => Array.from(this.deletedIds),

            /** 
             * 重置删除状态，清空已记录的删除ID集合
             * 
             * 通常在提交删除或取消操作时调用
             */
            clearDeletedStatus: () => this.deletedIds.clear(),
        };
    }

    /**
     * 物理上从状态中移除指定ID的实体
     * 
     * @param id - 要移除的实体ID
     * @private
     */
    private physicallyRemove(id: any) {
        const { host } = this;
        const idKey = host.schemaKeys.id;
        if (Array.isArray(host.state.items)) {
            host.state.items = host.state.items.filter((i: any) => i[idKey] !== id);
            host.state.total = Math.max(0, (host.state.total || 0) - 1);
        }
    }

    /**
     * 组件销毁时的清理工作
     * 清空删除记录，避免内存泄漏
     */
    protected onDispose(): void {
        this.deletedIds.clear();
    }
}
