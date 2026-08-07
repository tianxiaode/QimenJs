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
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import './list.css.ts';

export type { ListStatus, MarkForm, ListItemProps } from './ListItemComponent';
/** 列表项 */
export type ListItem = import('./ListItemComponent').ListItemProps;

/** 列表属性接口 */
export interface ListProps extends ItemGroupProps {
    items?: ListItem[];
}

class ListComponent extends ItemGroupPooledComponent {
    onAfterInit(props?: ListProps): void {
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

    update(props?: Partial<ListProps>): void {
        if (props?.items !== undefined) this.setItems(props.items);
        super.update(props);
    }
}

ListComponent.register();
export { ListComponent };
/** 列表实例类型 */
export type ListComponentInstance = InstanceType<typeof ListComponent>;
