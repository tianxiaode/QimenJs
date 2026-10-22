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
 * domEvents click 委托 [items]，emits/bridges select 自动转发点击事件。
 *
 * searchable option 开启搜索过滤：
 * - 在列表顶部插入搜索输入框
 * - 输入关键词时按 label 过滤列表项（保留分组标题）
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
        searchable: false,
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

    _clickedAction: any = null;
    _clickedActionData: any = null;
    _searchKeyword: string = '';
    _allItemsData: any[] = [];
    _searchInputEl: HTMLInputElement | null = null;

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        this.addCls('q-list');
        this.addCls(`q-list--${this.getData('size')}`);
        (this as any).itemContainer?.el?.classList.add('q-list__items');
        super.onAfterInit();
        if (this.getData('searchable')) {
            this._initSearchInput();
        }
    }

    _initSearchInput(): void {
        const container = this.getNodeEl('itemContainer');
        if (!container || !this.el) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'q-list__search-input';
        input.placeholder = '搜索...';

        const wrapper = document.createElement('div');
        wrapper.className = 'q-list__search';
        wrapper.appendChild(input);

        container.insertBefore(wrapper, container.firstChild);
        this._searchInputEl = input;

        input.addEventListener('input', () => {
            this._searchKeyword = input.value.trim().toLowerCase();
            this._filterItems();
        });
    }

    _filterItems(): void {
        if (!this._searchKeyword) {
            super.setItems(this._allItemsData);
            return;
        }
        const filtered = this._allItemsData.filter((item: any) => {
            if (item.classes === 'q-list__group-title') return true;
            const label = String(item.label ?? '').toLowerCase();
            return label.includes(this._searchKeyword);
        });
        super.setItems(filtered);
    }

    setItems(items: any[]): void {
        this._allItemsData = items;
        if (this._searchKeyword) {
            this._filterItems();
        } else {
            super.setItems(items);
        }
    }

    show(): void {
        const anchor = this.anchor ?? this.rawOptions?.anchor ?? this.el!;
        const placement = this.placement ?? this.rawOptions?.placement;
        if (this._searchKeyword) {
            this._searchKeyword = '';
            if (this._searchInputEl) this._searchInputEl.value = '';
            super.setItems(this._allItemsData);
        }
        this._showOverlay({ anchor, placement });
    }

    hide(): void {
        this._hideOverlay();
    }

    _onItemClick(domEvt: any): void {
        const item = domEvt?.targetComponent;
        if (!item) return;
        this._clickedAction = item.action ?? null;
        this._clickedActionData = item.actionData ?? null;
    }

    _onSizeOptionChange(value: string, old: string): void {
        this.toggleCls(`q-list--`, value, old);
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            itemCount: this.count,
            action: this._clickedAction,
            actionData: this._clickedActionData,
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
