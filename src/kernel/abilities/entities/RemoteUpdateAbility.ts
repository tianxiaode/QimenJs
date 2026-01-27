import { EntityError, KernelErrorCode } from '../../errors';
import { AbilityBase } from '../../composable';
import { FlowContext, IBaseEntityManager, IExposeResult } from '../../types';

/**
 * RemoteUpdateAbility - 远程更新能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求更新远程数据的功能。
 * 它封装了发送更新请求、处理响应、同步本地状态以及事件发射的完整流程。
 */
export class RemoteUpdateAbility<T, TCriteria> extends AbilityBase<IBaseEntityManager> {
    /**
     * 暴露远程更新操作的方法
     *
     * 此方法在能力被激活时由框架调用，用于向宿主对象（host）注入 update 方法。
     *
     * @returns 返回一个包含异步 update 方法的对象，该方法可用于执行更新操作。
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 更新一条记录
             *
             * 发送请求以更新服务器上的指定记录，并自动同步更新结果到本地状态。
             * 注意：此方法期望 payload 包含主键 ID 字段，以便识别要更新的记录。
             *
             * @param {Partial<T>} payload - 包含待更新字段及其新值的对象，必须包含主键 ID。
             * @returns {Promise<T>} 一个 Promise，解析为服务器返回的、已更新后的完整记录。
             * @throws {EntityError} 当操作进行中或请求失败时抛出错误。
             */
            update: async (payload: Partial<T>): Promise<T> => {
                // 1. 状态锁保护
                if (host.state.loading) {
                    throw new EntityError(
                        'Operation in progress, please wait.',
                        KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS
                    );
                }

                try {
                    // 2. 发起请求
                    // 'update' 动作通常会被 alignRequestOptions 自动转换为 PATCH 或 PUT
                    const result = await host.fetch('update', payload, (context: FlowContext) => {
                        const updatedRecord = context.data.item;

                        // 3. 【核心】状态同步：局部更新本地列表中的对应项
                        this.syncStateItems(updatedRecord);

                        // 4. 更新当前活跃项
                        host.state.item = updatedRecord;

                        host.emit('updated', updatedRecord);
                    });

                    return result.data.item;
                } catch (error) {
                    host.emit('update-error', error);
                    throw error;
                }
            },
        };
    }

    /**
     * 同步更新本地状态中的列表项
     *
     * 在成功更新单条记录后，此方法负责查找并更新 `host.state.items` 数组中对应的旧数据，
     * 以确保UI与最新的数据保持一致。它会创建一个新的数组实例，以保证响应式框架能检测到变化。
     *
     * @param {T} newData - 从服务器返回的、已更新的记录数据。
     */
    private syncStateItems(newData: T) {
        const { host } = this;
        const idKey = host.schemaKeys.id;
        const id = (newData as any)[idKey];

        if (Array.isArray(host.state.items)) {
            const index = host.state.items.findIndex((item: any) => item[idKey] === id);
            if (index !== -1) {
                // 采用解构赋值，确保引用的响应式更新（对于 Vue 等框架很重要）
                const newItems = [...host.state.items];
                newItems[index] = { ...newItems[index], ...newData };
                host.state.items = newItems;
            }
        }
    }
}
