import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

/**
 * RemoteGetAbility - 远程获取能力
 *
 * 提供获取远程单个实体的能力，通过HTTP请求与服务器交互
 *
 * @template T 实体的数据类型
 * @template TCriteria 搜索条件类型
 */
export class RemoteGetAbility<T, TCriteria> extends AbilityBase<IEntityManagerBase> {

    /**
     * 暴露远程获取实体的方法
     *
     * @returns 包含 remoteGet 方法的对象，用于远程获取单个实体
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 远程获取实体
             *
             * @param id 要获取的实体ID
             * @returns Promise<T> 获取的实体的Promise
             */
            remoteGet: async (id: string | number): Promise<T> => {
                // 设置加载状态
                host.state.loading = true;

                try {
                    // 使用fetch方法发送GET请求
                    const response = await host.fetch('get', id);

                    // 解析响应数据
                    const result = response.data?.item || response.data || response;

                    // 更新UI状态
                    host.state.item = result;

                    // 发出获取事件
                    host.emit('got', result);

                    return result;
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
}
