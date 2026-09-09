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
import { Definitions } from '@/composable';
import './menu.css';

const MenuComponentDefs: Definitions = {
    options: {
        anchor: null,
    },
} as const;

class MenuComponent extends ItemGroupStaticComponent {
    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '{MenuItem}.content',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['[action]'],
        },
        mouseenter: { path: '{MenuItem}', handler: '_onItemEnter' },
        mouseleave: { path: '{MenuItem}', handler: '_onItemLeave' },
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
            isOpen: this.isOverlayOpen,
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

    onAfterInit(): void {
        const self = this as any;
        super.onAfterInit();

        self.initGroupSelect({ defaultMode: 'radio' });
        self.registerGroupItems([...self.items]);
    }

    get itemGroup(): any {
        return this;
    }

    get isOpen(): boolean {
        return this.isOverlayOpen;
    }

    open(): void {
        if (this.isOverlayOpen) return;
        const anchor = this.getData('anchor') ?? this.el!;
        this.showOverlay(anchor, 'bottom', 4);
    }

    close(): void {
        if (!this.isOverlayOpen) return;
        this.hideOverlay();
    }

    onBeforeDispose(): void {
        this.close();
        (this as any).clearGroups();
    }
}

MenuComponent.use(GroupSelectAbility);
MenuComponent.define(MenuComponentDefs);

export { MenuComponent };
/** 菜单实例类型 */
export type MenuComponentInstance = InstanceType<typeof MenuComponent>;
