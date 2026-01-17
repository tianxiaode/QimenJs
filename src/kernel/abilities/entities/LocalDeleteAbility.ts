import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

export class LocalDeleteAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    // 影子状态：记录被删除的正式 ID
    private deletedIds = new Set<any>();

    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 本地删除：标记删除并从列表移除
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

            /** 获取所有被标记删除的正式 ID */
            getDeletedIds: () => Array.from(this.deletedIds),

            /** 重置删除状态 */
            clearDeletedStatus: () => this.deletedIds.clear(),
        };
    }

    private physicallyRemove(id: any) {
        const { host } = this;
        const idKey = host.schemaKeys.id;
        if (Array.isArray(host.state.items)) {
            host.state.items = host.state.items.filter((i: any) => i[idKey] !== id);
            host.state.total = Math.max(0, (host.state.total || 0) - 1);
        }
    }

    protected onDispose(): void {
        this.deletedIds.clear();
    }
}
