import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

export class RemoteGetAbility extends AbilityBase {
    /**
     * 暴露远程获取实体的方法
     *
     * @returns 包含 remoteGet 方法的对象，用于远程获取单个实体
     */
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            /**
             * 远程获取实体
             *
             * @param id 要获取的实体ID
             * @returns Promise<any> 获取的实体的Promise
             */
            get: async (id: string | number): Promise<any> => {
                const host = proxy.host;
                const { idField } = host.schemaKeys;

                const options = await host.buildOptions('get', { [idField]: id }, null, {});
                // 使用fetch方法发送GET请求
                const context = await host.fetch('get', options);

                // 解析响应数据
                const result = context.data?.item;

                // 更新UI状态
                await host.state.updateItem(result);
                return result;
            },
        };
    }
}
