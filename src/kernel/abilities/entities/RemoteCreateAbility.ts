/**
 * RemoteCreateAbility - 远程创建能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求创建远程数据的功能。
 * 它封装了发送创建请求、处理响应、同步本地状态以及事件发射的完整流程。
 */
import { AbilityBase } from '../../composable';
import { FlowContext, IBaseEntityManager, IExposeResult } from '../../types';
import { EntityError } from '../../errors/EntityError';
import { KernelErrorCode } from '../../errors/codes';

export class RemoteCreateAbility<T, TCriteria> extends AbilityBase<IBaseEntityManager> {
    /**
     * 暴露远程创建操作的方法
     *
     * 此方法在能力被激活时由框架调用，用于向宿主对象（host）注入 create 方法。
     *
     * @returns 返回一个包含异步 create 方法的对象，该方法可用于执行创建操作。
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 创建一条新记录
             *
             * 发送请求以在服务器上创建新记录，并自动同步创建结果到本地状态。
             *
             * @param {Partial<T>} data - 包含待创建记录所需字段的对象
             * @returns {Promise<T>} 一个 Promise，解析为服务器返回的、已创建后的完整记录。
             * @throws {EntityError} 当操作进行中或请求失败时抛出错误。
             */
            create: async (data: Partial<T>): Promise<T> => {
                // 1. 状态锁保护：防止请求飞行中再次触发
                if (host.state.loading) {
                    throw new EntityError('Operation in progress, please wait.', KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS);
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