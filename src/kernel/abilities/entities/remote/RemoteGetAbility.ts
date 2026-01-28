import { AbilityBase } from '../../../composable';
import { EntityState, IEntity, IBaseEntityManager, IExposeResult, SearchParams } from '../../../types';

export class RemoteGetAbility<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends EntityState<T, TSearch>,
> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
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
            get: async (id: string | number): Promise<T> => {
                const { idFiled } = host.schemaKeys;

                const options = host.buildOptions('get', { [idFiled]: id }, null, {});
                // 使用fetch方法发送GET请求
                const context = await host.fetch('get', options);

                // 解析响应数据
                const result = context.data?.item;

                // 更新UI状态
                host.state.updateItem(result);
                return result;
            },
        };
    }
}
