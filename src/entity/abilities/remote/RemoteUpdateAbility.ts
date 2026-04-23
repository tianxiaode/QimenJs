import { EntityError, KernelErrorCode } from '../../../errors';
import { AbilityBase } from '../../../composable';
import {
    EntityState,
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    SearchParams,
} from '../../../types';

/**
 * RemoteUpdateAbility - 远程更新能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求更新远程数据的功能。
 * 它封装了发送更新请求、处理响应、同步本地状态以及事件发射的完整流程。
 */
export class RemoteUpdateAbility<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends EntityState<T, TSearch>,
> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露远程更新操作的方法
     *
     * 此方法在能力被激活时由框架调用，用于向宿主对象（host）注入 update 方法。
     *
     * @returns 返回一个包含异步 update 方法的对象，该方法可用于执行更新操作。
     */
    protected expose(): IExposeResult {
        const { host } = this;
        const state = host.state;

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
            update: async (data: Partial<T>): Promise<T> => {
                const host = this.host;
                const state = host.state;
                // 1. 状态锁保护
                if (state.loading) {
                    throw new EntityError(
                        'Operation in progress, please wait.',
                        KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS
                    );
                }

                // 2. 发起请求
                // 'update' 动作通常会被 alignRequestOptions 自动转换为 PATCH 或 PUT
                const options = await host.buildOptions('update', {}, data, {});
                const context = await host.fetch('update', options);
                const item = context.data.item;
                await state.updateItem(item);
                host.emit('updated', item);
                return state.item!;
            },
        };
    }
}
