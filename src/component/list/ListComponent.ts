/**
 * ListComponent 列表组件
 *
 * 从 ItemGroupPooledComponent 派生（池化、数据驱动、order 排序）。
 * 子项默认类型：ListItem（label/description/status/markForm）。
 * 方向默认纵向。
 *
 * @example
 * ```ts
 * new ListComponent({
 *     items: [
 *         { label: '服务器运行中', status: 'success', markForm: 'dot' },
 *         { label: '磁盘空间不足', status: 'warning', markForm: 'ring' },
 *         { label: '连接已断开', status: 'error', markForm: 'dash' },
 *     ],
 * })
 * ```
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import './list.css';

export type { ListStatus, MarkForm } from './ListItemComponent';
/** 列表项 */
export type ListItem = Record<string, any>;

class ListComponent extends ItemGroupPooledComponent {
    onAfterInit(props?: Record<string, any>): void {
        this.addCls('q-list');
        (this as any).itemContainer?.el?.classList.add('q-list__items');

        super.onAfterInit({
            ...props,
            defaultItemType: 'ListItem',
            direction: 'vertical',
        });
    }

    get items(): ListItem[] {
        return this._items.map(item => item.data as ListItem);
    }
    set items(value: ListItem[]) {
        this.setItems(value);
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            itemCount: this.count,
        };
    }

    update(props?: Record<string, any>): void {
        if (props?.items !== undefined) this.setItems(props.items);
        super.update(props);
    }
}

export { ListComponent };
/** 列表实例类型 */
export type ListComponentInstance = InstanceType<typeof ListComponent>;
