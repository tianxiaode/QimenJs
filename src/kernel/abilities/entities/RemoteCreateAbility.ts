import { AbilityBase } from '../../composable';
import { FlowContext, IEntityManagerBase, IExposeResult } from '../../types';

export class RemoteCreateAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * create: 创建新记录
             */
            create: async (data: Partial<T>): Promise<T> => {
                // 1. 状态锁保护：防止请求飞行中再次触发
                if (host.state.loading) {
                    return Promise.reject(new Error('Operation in progress, please wait.'));
                }

                try {
                    // 2. 发起请求 (fetch 内部会自动处理 loading 状态的切换)
                    const result = await host.fetch('create', data, (context: FlowContext) => {
                        const newRecord = context.data.item;

                        // 3. 数据回流：如果是列表模式，把新数据推入首行
                        if (Array.isArray(host.state.items)) {
                            host.state.items = [newRecord, ...host.state.items];
                            host.state.total += 1;
                        }

                        // 4. 更新当前活跃项
                        host.state.item = newRecord;

                        host.emit('created', newRecord);
                    });

                    return result.data.item;
                } catch (error) {
                    host.emit('create-error', error);
                    throw error;
                }
            },
        };
    }
}
