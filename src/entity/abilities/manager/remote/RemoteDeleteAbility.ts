import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

/**
 * RemoteDeleteAbility - 远程删除能力
 *
 * 提供删除远程实体的能力，通过HTTP请求与服务器交互。
 * 支持单个或批量删除操作，并自动更新本地状态。
 */
export class RemoteDeleteAbility extends AbilityBase {
    /**
     * 暴露远程删除实体的方法
     *
     * @returns 包含 remoteDelete 方法的对象，用于远程删除实体
     */
    protected expose(proxy: AbilityProxy): IExposeResult {
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
            delete: async (id: string | number | (string | number)[]): Promise<void> => {
                const host = proxy.host;
                const state = host.state;
                const isBatch = Array.isArray(id);
                const action = isBatch ? 'batch-delete' : 'delete';
                const options = isBatch
                    ? await host.buildOptions(action, {}, { ids: id }, {})
                    : await host.buildOptions(action, { [state.idField]: id }, null, {});
                const context = await host.fetch(action, options);
                await state.delete(id);
            },
        };
    }
}
