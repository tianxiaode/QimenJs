/**
 * MenuComponent 浮层菜单组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * 调度中心负责：定位计算、z-index 管理、OverlayRoot 挂载/卸载、clickOutside/escape 关闭。
 * MenuComponent 只负责：渲染菜单项、分组选中态管理、open/close 简单生命周期。
 *
 * 复用 GroupSelectAbility 实现分组选中态管理（radio/checkbox）。
 * 默认使用 MenuItem 作为子项组件，可通过 itemType 替换。
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import type { Placement } from '@qimenjs/component-core';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

export interface MenuProps {
    anchor?: HTMLElement;
    placement?: Placement;
    offset?: number;
    itemType?: string;
    items?: Record<string, any>[];
}

const MenuBase = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [{ tag: 'div', name: 'content', className: 'q-menu__content' }],
    },
    body: {
        type: 'Menu',

        _isOpen: false,
        _itemGroup: null as ItemGroupComponent | null,
        _documentClickHandler: null as ((e: MouseEvent) => void) | null,

        _initMenu(props?: MenuProps & Record<string, any>): void {
            this.el.classList.add('q-menu');

            if (props?.anchor) this._anchor = props.anchor;

            this.initGroupSelect({ defaultMode: 'radio' });

            this._itemGroup = new ItemGroupComponent({
                itemType: props?.itemType ?? 'MenuItem',
                direction: 'vertical',
                eventKey: 'item',
                events: ['click', 'select'],
                items: props?.items,
            });

            this.registerGroupItems([...this._itemGroup.items]);

            this._itemGroup.on('item:select', (data: any) => {
                this.notifyGroupSelect(data.item);
            });

            const container = this.nodeMap?.content?.el;
            if (container) {
                container.appendChild(this._itemGroup.el);
            }
        },

        get itemGroup(): ItemGroupComponent {
            return this._itemGroup;
        },

        get isOpen(): boolean {
            return this._isOpen;
        },

        open(): void {
            if (this._isOpen) return;

            this.el.style.display = '';
            this._isOpen = true;
        },

        close(): void {
            if (!this._isOpen) return;

            this.el.style.display = 'none';
            this._isOpen = false;
        },

        dispose(): void {
            this.close();
            this.clearGroups();
            if (this._itemGroup) {
                this._itemGroup.dispose();
            }
            (this.constructor as any).__proto__.dispose.call(this);
        },
    },
}).with([GroupSelectAbility]);

export let MenuComponent = MenuBase;

export type MenuComponent = InstanceType<typeof MenuBase>;
