import { AbilityBase } from '../../composable';
import { IBaseEntityManager, IExposeResult } from '../../types';

/**
 * RemoteDeleteAbility - 远程删除能力
 * 
 * 提供删除远程实体的能力，通过HTTP请求与服务器交互。
 * 支持单个或批量删除操作，并自动更新本地状态。
 * 
 * @template T - 实体的数据类型
 * @template TCriteria - 搜索字段类型
 */
export class RemoteDeleteAbility<T, TCriteria> extends AbilityBase<IBaseEntityManager> {

    /**
     * 暴露远程删除实体的方法
     * 
     * @returns 包含 remoteDelete 方法的对象，用于远程删除实体
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 远程删除一个或多个实体
             * 
             * 根据传入的目标类型自动判断是单个删除还是批量删除，
             * 发起相应的API调用并更新本地状态。
             * 
             * @param target - 要删除的实体ID或ID数组
             * @returns Promise<void> 删除操作完成的Promise
             * @throws {Error} 当删除请求失败时抛出错误
             */
            remoteDelete: async (target: any | any[]): Promise<void> => {
                const ids = Array.isArray(target) ? target : [target];
                if (ids.length === 0) return;

                // 设置加载状态
                host.state.loading = true;

                try {
                    const action = ids.length === 1 ? 'delete' : 'batch-delete';
                    const payload = ids.length === 1 ? ids[0] : ids;

                    await host.fetch(action, payload, () => {
                        // 成功回调：物理移除 state.items 中的项
                        this.physicallyRemove(ids);
                        host.emit('deleted', ids);
                    });
                } catch (error) {
                    // 发出错误事件
                    host.emit('error', error);
                    throw error;
                } finally {
                    // 重置加载状态
                    host.state.loading = false;
                }
            }
        };
    }

    /**
     * 从状态中物理移除指定的记录
     * 
     * 从 items 数组中过滤掉指定 ID 的记录，并更新 total 计数。
     * 如果当前 item 的 ID 在要移除的列表中，则将其置为 null。
     * 
     * @private
     * @param ids - 要移除的记录ID数组
     */
    private physicallyRemove(ids: any[]) {
        const { host } = this;
        const idKey = host.schemaKeys.id;
        
        // 从 items 数组中移除匹配的项目
        if (Array.isArray(host.state.items)) {
            host.state.items = host.state.items.filter((i: any) => !ids.includes(i[idKey]));
            host.state.total = Math.max(0, (host.state.total || 0) - ids.length);
        }
        
        // 如果当前选中的 item 被删除，则清空它
        if (host.state.item && ids.includes(host.state.item[idKey])) {
            host.state.item = null;
        }
    }
}