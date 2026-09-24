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
import { Definitions } from '@/composable';
import './list.css';

export type { ListStatus, MarkForm } from './ListItemComponent';
/** 列表项 */
export type ListItem = Record<string, any>;

const ListComponentDefs: Definitions = {
    options: {
        size: 'md',
    },
} as const;

class ListComponent extends ItemGroupPooledComponent {
    static type = 'list';
    defaultItemType = 'list-item';

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        this.addCls('q-list');
        this.addCls(`q-list--${this.getData('size')}`);
        (this as any).itemContainer?.el?.classList.add('q-list__items');

        super.onAfterInit();
    }

    _onSizeOptionChange(value: string, old: string): void {
        this.toggleCls(`q-list--`, value, old);
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

ListComponent.define(ListComponentDefs);

export { ListComponent };
/** 列表实例类型 */
export type ListComponentInstance = InstanceType<typeof ListComponent>;
