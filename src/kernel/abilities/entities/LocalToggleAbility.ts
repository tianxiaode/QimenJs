import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';

export class LocalToggleAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 本地切换状态，记录到 dirtyMap
             */
            toggle: (id: any, field: keyof T): void => {
                const idKey = host.schemaKeys.id;
                const items = host.state.items || [];
                const item = items.find((i: any) => i[idKey] === id);
                if (!item) return;

                const currentValue = (item as any)[field];
                const newValue = typeof currentValue === 'boolean' ? !currentValue : (currentValue ? 0 : 1);

                // 调用同一宿主上的 localUpdate 逻辑
                // 这体现了 Ability 之间通过 host 协同的优势
                if ((host as any).localUpdate) {
                    (host as any).localUpdate(id, { [field]: newValue });
                } else {
                    // 如果没挂载 LocalUpdateAbility，则简单地修改内存
                    const index = items.indexOf(item);
                    const newItems = [...items];
                    newItems[index] = { ...item, [field]: newValue, _isDirty: true };
                    host.state.items = newItems;
                }

                host.emit('toggled', { id, field, value: newValue });
            }
        };
    }
}