import { AbilityBase } from '../../composable';
import { FlowContext, IEntityManagerBase, IExposeResult } from '../../types';

export class RemoteUpdateAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * update: 更新记录
             * @param id 记录的主键
             * @param patch 待更新的部分数据
             */
            update: async (payload: Partial<T>): Promise<T> => {
                // 1. 状态锁保护
                if (host.state.loading) {
                    return Promise.reject(new Error('Operation in progress.'));
                }

                try {
                    // 2. 发起请求
                    // 'update' 动作通常会被 alignRequestOptions 自动转换为 PATCH 或 PUT
                    const result = await host.fetch(
                        'update',
                        payload,
                        (context: FlowContext) => {
                            const updatedRecord = context.data.item;

                            // 3. 【核心】状态同步：局部更新本地列表中的对应项
                            this.syncStateItems(updatedRecord);

                            // 4. 更新当前活跃项
                            host.state.item = updatedRecord;

                            host.emit('updated', updatedRecord);
                        }
                    );

                    return result.data.item;
                } catch (error) {
                    host.emit('update-error', error);
                    throw error;
                }
            },
        };
    }

    /**
     * 同步本地状态
     */
    private syncStateItems(newData: T) {
        const { host } = this;
        const idKey = host.schemaKeys.id;
        const id =  (newData as any)[idKey];

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
