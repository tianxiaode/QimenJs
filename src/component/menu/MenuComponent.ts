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
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import { DomEventsMap } from '@qimenjs/component-core';
import './menu.css.ts';

/** 菜单属性接口 */
export interface MenuProps extends ItemGroupProps {
    anchor?: HTMLElement;
    placement?: string;
    offset?: number;
}

class MenuComponent extends ItemGroupStaticComponent {
    _anchor: HTMLElement | null = null;
    _isOpen: boolean = false;

    domEvents?: DomEventsMap | undefined = {
        click: {
            'MenuItem.content': {
                handler: '_onItemClick',
                emits: ['select', '[action]'],
                bridges: ['[action]'],
            },
        },
        mouseenter: {
            MenuItem: {
                handler: '_onItemEnter',
            },
        },
        mouseleave: {
            MenuItem: {
                handler: '_onItemLeave',
            },
        },
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
            isOpen: self._isOpen,
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

    onAfterInit(props?: MenuProps & Record<string, any>): void {
        const self = this as any;
        if (props?.anchor) self._anchor = props.anchor;

        super.onAfterInit(props);

        self.initGroupSelect({ defaultMode: 'radio' });
        self.registerGroupItems([...self.items]);
    }

    get itemGroup(): any {
        return this;
    }

    get isOpen(): boolean {
        const self = this as any;
        return self._isOpen;
    }

    open(): void {
        const self = this as any;
        if (self._isOpen) return;
        self.el.style.display = '';
        self._isOpen = true;
    }

    close(): void {
        const self = this as any;
        if (!self._isOpen) return;
        self.el.style.display = 'none';
        self._isOpen = false;
    }

    onBeforeDispose(): void {
        const self = this as any;
        self.close();
        self.clearGroups();
    }
}

MenuComponent.use(GroupSelectAbility);

export { MenuComponent };
/** 菜单实例类型 */
export type MenuComponentInstance = InstanceType<typeof MenuComponent>;
