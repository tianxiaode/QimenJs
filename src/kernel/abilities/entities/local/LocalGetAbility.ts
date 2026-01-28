import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    ILocalEntityState,
    ILocalSearchParams,
} from '../../../types';
import { AbilityBase } from '../../../composable';

export class LocalGetAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends ILocalEntityState<T, TSearch>,
> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {

    protected expose(): IExposeResult {
        const { host } = this;
        const { state } = host;

        return {
            /**
             * 从本地内存中根据 ID 获取实体
             * @param id 实体唯一标识
             */
            get: (id: string | number): T | null => {
                const { idField } = host.schema;

                // 1. 在内存源数据中查找
                const result = state.sourceData.find(
                    item => (item as any)[idField] === id
                ) || null;

                // 2. 更新状态槽位
                state.item = result; //
                
                // 3. 发出事件
                host.emit('got', result);

                return result;
            }
        };
    }
}