import { AbilityBase } from '../../composable';
import { IBaseEntityManager, IExposeResult } from '../../types';

/**
 * LocalCreateAbility - 本地创建能力
 * 
 * 提供在本地创建实体的能力，包括生成临时ID和更新UI状态
 * 
 * @template T 实体类型
 * @template TCriteria 搜索条件类型
 */
export class LocalCreateAbility<T, TCriteria> extends AbilityBase<IBaseEntityManager> {
    private static _tempIdCounter = -1;

    /**
     * 暴露创建实体的方法
     * 
     * @returns 包含create方法的对象，用于创建新的实体记录
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 创建一个新的实体记录
             * 
             * @param initialData 初始数据，可以是实体的部分属性
             * @returns 创建的新实体记录
             */
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