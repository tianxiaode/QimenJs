import { AbilityBase } from '../../composable';
import { IBaseEntityManager, IExposeResult } from '../../types';

/**
 * LocalToggleAbility - 本地切换能力
 * 
 * 提供在本地切换实体状态的能力，例如切换选中/未选中状态
 * 
 * @template T 实体类型
 * @template TCriteria 搜索条件类型
 */
export class LocalToggleAbility<T, TCriteria> extends AbilityBase<IBaseEntityManager> {

    /**
     * 暴露切换实体状态的方法
     * 
     * @returns 包含toggle方法的对象，用于切换指定实体的状态
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 切换指定实体的状态
             * 
             * @param record 要切换状态的实体记录
             * @returns 切换状态后的实体记录
             */
            toggle: (record: T): T => {
                const idKey = host.schemaKeys.id;
                const id = (record as any)[idKey];

                // 查找并切换状态
                const targetItem = host.state.items.find((item: T) => {
                    const itemId = (item as any)[idKey];
                    return itemId === id;
                });

                if (targetItem) {
                    // 切换状态，例如添加或移除_selected标记
                    (targetItem as any)._selected = !(targetItem as any)._selected;
                    
                    // 发出切换事件
                    host.emit('toggled', targetItem);
                }

                return record;
            }
        };
    }
}