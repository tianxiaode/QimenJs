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
    get defaultItemType(): string {
        return 'menu-item';
    }

    get defaultOptions(): Record<string, any> {
        return {
            ...super.defaultOptions,
            direction: 'vertical',
            align: 'start',
        };
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-menu');
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '{MenuItem}',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['select', '[action]'],
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
        const item = domEvt.targetComponent;
        if (!item) return;

        if (!item.select()) return;

        (this as any).notifyGroupSelect(item);

        if (!item._hasSubmenu) {
            this.close();
        }
    }

    _onItemEnter(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item) return;

        if (item._hasSubmenu && !item._disabled) {
            item.setExpandArrow('expanded');
        }
    }

    _onItemLeave(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item) return;

        if (item._hasSubmenu) {
            item.setExpandArrow('collapsed');
        }
    }

    setItems(datas: Record<string, any>[]): void {
        super.setItems(datas);
        for (const item of this.items) {
            if ((item as any)._hasSubmenu) {
                (item as any).setExpandArrow('collapsed');
            }
        }
        this.initGroupSelect({ defaultMode: 'radio' });
        this.registerGroupItems(this.items);
    }

    get itemGroup(): any {
        return this;
    }

    show(): void {
        const anchor = this.anchor ?? this.rawOptions?.anchor ?? this.el!;
        console.log('[MenuComponent.show] this.anchor:', this.anchor?.tagName, 'this.anchor.rect:', this.anchor?.getBoundingClientRect ? JSON.stringify({x: this.anchor.getBoundingClientRect().x, y: this.anchor.getBoundingClientRect().y, w: this.anchor.getBoundingClientRect().width, h: this.anchor.getBoundingClientRect().height}) : 'N/A');
        console.log('[MenuComponent.show] rawOptions?.anchor:', this.rawOptions?.anchor?.tagName, 'rawOptions?.anchor.rect:', this.rawOptions?.anchor?.getBoundingClientRect ? JSON.stringify({x: this.rawOptions.anchor.getBoundingClientRect().x, y: this.rawOptions.anchor.getBoundingClientRect().y, w: this.rawOptions.anchor.getBoundingClientRect().width, h: this.rawOptions.anchor.getBoundingClientRect().height}) : 'N/A');
        console.log('[MenuComponent.show] this.el:', this.el?.tagName, 'this.el.rect:', this.el?.getBoundingClientRect ? JSON.stringify({x: this.el.getBoundingClientRect().x, y: this.el.getBoundingClientRect().y, w: this.el.getBoundingClientRect().width, h: this.el.getBoundingClientRect().height}) : 'N/A');
        console.log('[MenuComponent.show] final anchor:', anchor?.tagName, 'anchor.rect:', anchor?.getBoundingClientRect ? JSON.stringify({x: anchor.getBoundingClientRect().x, y: anchor.getBoundingClientRect().y, w: anchor.getBoundingClientRect().width, h: anchor.getBoundingClientRect().height}) : 'N/A');
        this._showOverlay({ anchor });
    }

    hide(): void {
        this._hideOverlay();
    }

    open(): void {
        if (this.isOpen) return;
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
