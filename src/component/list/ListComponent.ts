/**
 * ListComponent 列表组件
 *
 * 从 ItemGroupPooledComponent 派生（池化、数据驱动、order 排序）。
 * 子项默认类型：ListItem（label/description/status/markForm）。
 * 方向默认纵向。
 *
 * 双用途：内嵌列表 + 浮层面板。
 * 作为浮层时（如 Select 下拉面板），通过 PopoverAbility 实例化，
 * show()/hide() 调用 OverlayAbility 定位/显隐。
 * domEvents click 委托 [items]，emits select 自动转发点击事件。
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
import type { DomEventsMap } from '@qimenjs/component-core';
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

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '[items]',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['select', '[action]'],
        },
    };

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        this.addCls('q-list');
        this.addCls(`q-list--${this.getData('size')}`);
        (this as any).itemContainer?.el?.classList.add('q-list__items');

        super.onAfterInit();
    }

    show(): void {
        const anchor = this.anchor ?? this.rawOptions?.anchor ?? this.el!;
        const placement = this.placement ?? this.rawOptions?.placement;
        this._showOverlay({ anchor, placement });
    }

    hide(): void {
        this._hideOverlay();
    }

    _onItemClick(domEvt: any): void {
        console.log('[List._onItemClick] domEvt:', domEvt);
        const item = domEvt?.targetComponent;
        console.log('[List._onItemClick] item:', item, 'action:', item?.action, 'actionData:', item?.actionData);
        if (!item) return;
        const action = item.action;
        if (action) domEvt.action = action;
        const actionData = item.actionData;
        if (actionData !== undefined && actionData !== null) {
            domEvt.actionData = actionData;
        }
        console.log('[List._onItemClick] after set: action:', domEvt.action, 'actionData:', domEvt.actionData);
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
