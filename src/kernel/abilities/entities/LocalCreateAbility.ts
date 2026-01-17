import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

export class LocalCreateAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    private static _tempIdCounter = -1;

    protected expose(): IExposeResult {
        const { host } = this;

        return {
            create: (initialData: Partial<T> = {}): T => {
                // 1. 获取配置好的 idKey 和 idType
                const idKey = host.schemaKeys.id;
                const idType = (host as any).schemaIdType; // 之前 expose 出来的属性

                // 2. 生产 ID：逻辑清晰，无副作用
                const tempId = idType === 'number' 
                    ? LocalCreateAbility._tempIdCounter-- 
                    : `tmp_${Math.random().toString(36).slice(2, 9)}`;

                // 3. 组装数据
                const newRecord = {
                    [idKey]: tempId,
                    ...initialData,
                    _isLocal: true // 依然保留这个内部标记，方便后续过滤
                } as any;

                // 4. 更新 UI 状态
                host.state.items = [newRecord, ...(host.state.items || [])];
                host.state.item = newRecord;

                host.emit('created', newRecord);
                return newRecord;
            }
        };
    }
}