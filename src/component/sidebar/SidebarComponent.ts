/**
 * SidebarComponent 侧边栏组件
 *
 * 可折叠侧边栏，支持菜单项和分组。
 * 数据驱动：通过 items 属性设置菜单项。
 *
 * 模板节点：
 * - header — 侧边栏头部
 * - items — 菜单项容器
 * - toggle — 折叠按钮
 *
 * @example
 * ```ts
 * new SidebarComponent({
 *     title: '导航',
 *     items: [
 *         { text: '首页', icon: '🏠', key: 'home' },
 *         { text: '设置', icon: '⚙', key: 'settings' },
 *     ],
 * })
 * sidebar.on('itemClick', ({ key, index }) => { ... })
 * sidebar.collapsed = true;
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export interface SidebarItem {
    text: string;
    key: string;
    icon?: string;
    active?: boolean;
    disabled?: boolean;
    children?: SidebarItem[];
}

export interface SidebarProps {
    title?: string;
    items?: SidebarItem[];
    collapsed?: boolean;
    width?: string;
    collapsible?: boolean;
}

class SidebarComponent extends Component {
    _title: string = '';
    _items: SidebarItem[] = [];
    _collapsed: boolean = false;
    _width: string = '240px';
    _collapsible: boolean = false;
    _itemEls: HTMLElement[] = [];
    _clickBound: boolean = false;

    onAfterInit(props?: SidebarProps): void {
        this._initSidebar(props);
    }

    _initSidebar(props?: SidebarProps): void {
        if (props?.title) {
            this._title = props.title;
            this.title = props.title;
        } else {
            this.setNodeHidden(true, 'title');
        }

        if (props?.width) {
            this._width = props.width;
            (this.el as HTMLElement).style.width = props.width;
        }

        if (props?.collapsible) {
            this._collapsible = props.collapsible;
            this.setNodeHidden(false, 'toggle');
            this._bindToggle();
        }

        if (props?.collapsed) {
            this.collapsed = props.collapsed;
        }

        if (props?.items) {
            this._items = props.items;
            this._renderItems();
        }

        this._bindItemClick();
    }

    _bindToggle(): void {
        const toggleEl = this.nodeMap?.toggle?.el as HTMLElement | null;
        if (!toggleEl) return;
        this.bind(toggleEl, 'click');
        this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
            const target = ctx?.data?.originalEvent?.target as HTMLElement | null;
            if (target?.closest('.q-sidebar__toggle')) {
                this.collapsed = !this._collapsed;
                this.emit('collapse', { collapsed: this._collapsed });
            }
        });
    }

    _bindItemClick(): void {
        if (this._clickBound) return;
        const container = this.nodeMap?.items?.el as HTMLElement | null;
        if (!container) return;

        this._clickBound = true;
        this.bind(container, 'click');
        this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
            const target = ctx?.data?.originalEvent?.target as HTMLElement | null;
            const itemEl = target?.closest('.q-sidebar__item') as HTMLElement | null;
            if (!itemEl || itemEl.classList.contains('q-sidebar__item--disabled')) return;
            const key = itemEl?.dataset?.key;
            const index = itemEl?.dataset?.index;
            if (key !== undefined && index !== undefined) {
                this._setActiveItem(Number(index));
                this.emit('itemClick', { key, index: Number(index) });
            }
        });
    }

    _setActiveItem(activeIndex: number): void {
        for (let i = 0; i < this._itemEls.length; i++) {
            this._itemEls[i].classList.toggle('q-sidebar__item--active', i === activeIndex);
        }
    }

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        this._title = value;
    }

    get items(): SidebarItem[] {
        return this._items;
    }
    set items(value: SidebarItem[]) {
        this._items = value;
        this._renderItems();
    }

    get collapsed(): boolean {
        return this._collapsed;
    }
    set collapsed(value: boolean) {
        this._collapsed = value;
        this.toggleCls('q-sidebar--collapsed', value);
        if (value) {
            (this.el as HTMLElement).style.width = '56px';
        } else {
            (this.el as HTMLElement).style.width = this._width;
        }
    }

    get collapsible(): boolean {
        return this._collapsible;
    }

    _renderItems(): void {
        const container = this.nodeMap?.items?.el as HTMLElement | null;
        if (!container) return;

        container.innerHTML = '';
        this._itemEls = [];

        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            const itemEl = document.createElement('div');
            itemEl.className = 'q-sidebar__item';
            itemEl.dataset.key = item.key;
            itemEl.dataset.index = String(i);

            if (item.active) itemEl.classList.add('q-sidebar__item--active');
            if (item.disabled) itemEl.classList.add('q-sidebar__item--disabled');

            if (item.icon) {
                const iconEl = document.createElement('span');
                iconEl.className = 'q-sidebar__item-icon';
                iconEl.textContent = item.icon;
                itemEl.appendChild(iconEl);
            }

            const textEl = document.createElement('span');
            textEl.className = 'q-sidebar__item-text';
            textEl.textContent = item.text;
            itemEl.appendChild(textEl);

            container.appendChild(itemEl);
            this._itemEls.push(itemEl);

            if (item.children?.length) {
                for (let j = 0; j < item.children.length; j++) {
                    const child = item.children[j];
                    const childEl = document.createElement('div');
                    childEl.className = 'q-sidebar__item q-sidebar__item--sub';
                    childEl.dataset.key = child.key;
                    childEl.dataset.index = String(i);

                    if (child.active) childEl.classList.add('q-sidebar__item--active');
                    if (child.disabled) childEl.classList.add('q-sidebar__item--disabled');

                    const childTextEl = document.createElement('span');
                    childTextEl.className = 'q-sidebar__item-text';
                    childTextEl.textContent = child.text;
                    childEl.appendChild(childTextEl);

                    container.appendChild(childEl);
                    this._itemEls.push(childEl);
                }
            }
        }
    }

    update(props?: Partial<SidebarProps>): void {
        if (props?.title !== undefined) {
            this.title = props.title;
            this.setNodeHidden(!props.title, 'title');
        }
        if (props?.items !== undefined) this.items = props.items;
        if (props?.collapsed !== undefined) this.collapsed = props.collapsed;
    }
}

export { SidebarComponent };
export type SidebarComponentInstance = InstanceType<typeof SidebarComponent>;
