/**
 * MenuComponent 菜单组件
 *
 * 从 ItemGroupStaticComponent 派生，通过 domEvents 集中处理子项事件，
 * 委托 MenuItemComponent.select() / setExpandArrow() 执行状态变更。
 *
 * domEvents 路径：
 * - 'MenuItem.content' → 点击菜单项内容区域
 * - 'MenuItem'        → 鼠标进入/离开菜单项（子菜单箭头反馈）
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import { DomEventsMap } from '@qimenjs/component-core';
import './menu.css';

class MenuComponent extends ItemGroupStaticComponent {
    static type = 'menu';
    defaultItemType = 'menu-item';
    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '{MenuItem}.content',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['[action]'],
        },
        enter: { path: '{MenuItem}', handler: '_onItemEnter' },
        leave: { path: '{MenuItem}', handler: '_onItemLeave' },
    };

    get defaultEventData(): Record<string, any> {
        const self = this as any;
        const groupNames: string[] = self.getGroupNames?.() ?? [];
        const selected: Record<string, any> = {};
        for (const name of groupNames) {
            selected[name] = self.getGroupCheckedIndex?.(name);
        }
        return {
            ...super.defaultEventData,
            isOpen: this.isOpen,
            selected,
        };
    }

    _onItemClick(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component;
        if (!item.select()) return;

        (this as any).notifyGroupSelect(item);
    }

    _onItemEnter(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component;
        if (item._hasSubmenu && !item._disabled) {
            item.setExpandArrow('expanded');
        }
    }

    _onItemLeave(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component;
        if (item._hasSubmenu) {
            item.setExpandArrow('collapsed');
        }
    }

    setItems(datas: Record<string, any>[]): void {
        super.setItems(datas);
        for (const item of this._items) {
            if ((item as any)._hasSubmenu) {
                (item as any).setExpandArrow('collapsed');
            }
        }
        this.initGroupSelect({ defaultMode: 'radio' });
        this.registerGroupItems(this._items);
    }

    get itemGroup(): any {
        return this;
    }

    open(): void {
        if (this.isOpen) return;
        if (!this.anchor) {
            this._setRawData('anchor', this.el!);
        }
        this.show();
    }

    close(): void {
        if (!this.isOpen) return;
        this.hide();
    }

    onBeforeDispose(): void {
        this.close();
        (this as any).clearGroups();
    }
}

MenuComponent.use(GroupSelectAbility);

export { MenuComponent };
