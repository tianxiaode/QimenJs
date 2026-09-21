/**
 * MenuComponent 菜单组件
 *
 * 从 ItemGroupStaticComponent 派生，通过 domEvents 集中处理子项事件，
 * 委托 MenuItemComponent.select() / setExpandArrow() 执行状态变更。
 *
 * domEvents 路径：
 * - 'MenuItem' → 点击菜单项、鼠标进入/离开菜单项
 *
 * 子菜单支持（桌面 hover 浮层）：
 * - item 配置 submenu: [...] 时，hover 该菜单项在右侧（水平菜单在下方）弹出子菜单
 * - 支持任意层嵌套（demo 演示 3 层）
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import { DomEventsMap } from '@qimenjs/component-core';
import './menu.css';

class MenuComponent extends ItemGroupStaticComponent {
    static type = 'menu';
    defaultItemType: string = 'menu-item';

    _submenuMap: Map<any, any> = new Map();
    _openSubmenuKey: any = null;
    _pendingItem: any = null;
    _enterTimer: any = null;
    _leaveTimer: any = null;

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

    /** 是否本层直接子项（过滤子菜单的项，避免父层处理子菜单事件） */
    private _isOwnItem(item: any): boolean {
        return (this.items || []).includes(item);
    }

    _onItemClick(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item) return;
        if (!this._isOwnItem(item)) return;

        const action = item.getData?.('action');
        if (action) domEvt.action = action;

        if (!item.select()) return;

        (this as any).notifyGroupSelect(item);

        if (!item._submenu) {
            this.close();
        }
    }

    _onItemEnter(domEvt: any): void {
        const item = domEvt.targetComponent;
        console.log(`[_onItemEnter] item=${item?.getData?.('text')} _submenu=${!!item?._submenu} _disabled=${!!item?._disabled} isOwn=${this._isOwnItem(item)} openKey=${this._openSubmenuKey === item}`);
        if (!item) return;
        if (!this._isOwnItem(item)) return;

        if (item === this._openSubmenuKey) return;

        if (item._submenu && !item._disabled) {
            item.setExpandArrow('expanded');
            this._scheduleOpen(item);
        } else {
            this._closeOtherSubmenus(item);
        }
    }

    _onItemLeave(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item) return;
        if (!this._isOwnItem(item)) return;

        if (item._submenu) {
            item.setExpandArrow('collapsed');
            this._scheduleClose(item);
        }
    }

    setItems(datas: Record<string, any>[]): void {
        super.setItems(datas);
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const data = datas[i];
            console.log(`[setItems] i=${i} text=${data?.text} hasSubmenu=${!!data?.submenu} item._submenu=${!!item?._submenu}`);
            if (data?.submenu) {
                item._submenu = data.submenu;
                item.addCls('q-menu-item--has-submenu');
                item.removeCls('hidden', 'expand');
                item.setExpandArrow('collapsed');
                console.log(`[setItems] set _submenu on item "${data.text}", submenu len=${data.submenu.length}`);
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

    // ─── 子菜单浮层管理 ───

    private _scheduleOpen(item: any): void {
        console.log(`[_scheduleOpen] item=${item?.getData?.('text')} pending=${this._pendingItem === item}`);
        if (this._pendingItem !== item) {
            this._closeOtherSubmenus(item);
            this._pendingItem = item;
        }
        window.clearTimeout(this._enterTimer);
        window.clearTimeout(this._leaveTimer);
        this._enterTimer = window.setTimeout(() => this._openSubmenu(item), 120);
    }

    private _scheduleClose(item: any): void {
        window.clearTimeout(this._enterTimer);
        this._leaveTimer = window.setTimeout(() => this._closeSubmenu(item), 300);
    }

    private _closeOtherSubmenus(exceptItem: any): void {
        if (this._openSubmenuKey && this._openSubmenuKey !== exceptItem) {
            this._closeSubmenu(this._openSubmenuKey);
            this._pendingItem = exceptItem;
        }
    }

    private _openSubmenu(item: any): void {
        console.log(`[_openSubmenu] item=${item?.getData?.('text')} _submenu=${!!item?._submenu} openKey=${this._openSubmenuKey === item}`);
        if (!item._submenu) return;
        if (this._openSubmenuKey === item) return;

        let sub = this._submenuMap.get(item);
        if (!sub) {
            console.log(`[_openSubmenu] creating new MenuComponent for "${item?.getData?.('text')}", submenu len=${item._submenu.length}`);
            sub = new MenuComponent({
                items: item._submenu,
                direction: this.direction,
            });
            console.log(`[_openSubmenu] sub.el created, children=${sub.el?.children?.length}, items=${sub.items?.length}`);
            this._submenuMap.set(item, sub);
            sub.on('select', (data: any) => {
                const payload = data?.data ?? data;
                this.emit('select', payload);
                this._closeSubmenuChain(sub);
            });
        }

        const placement = this.direction === 'horizontal' ? 'bottom' : 'right';
        console.log(`[_openSubmenu] calling _showOverlay anchor=${!!item.el} placement=${placement} sub.isOpen=${sub.isOpen}`);
        sub._showOverlay({ anchor: item.el, placement });
        console.log(`[_openSubmenu] after _showOverlay sub.isOpen=${sub.isOpen} sub.el.style.display="${sub.el?.style?.display}" sub.el.children=${sub.el?.children?.length}`);
        this._openSubmenuKey = item;
    }

    private _closeSubmenu(item: any): void {
        const sub = this._submenuMap.get(item);
        if (sub) {
            sub.closeAllSubmenus();
            sub._hideOverlay();
        }
        if (this._openSubmenuKey === item) {
            this._openSubmenuKey = null;
        }
    }

    /** 关闭当前菜单的全部子菜单链（含递归层级） */
    closeAllSubmenus(): void {
        for (const item of Array.from(this._submenuMap.keys())) {
            this._closeSubmenu(item);
        }
        this._pendingItem = null;
    }

    /** 从指定子菜单向上关闭整条链 */
    private _closeSubmenuChain(sub: any): void {
        sub.closeAllSubmenus();
        this.closeAllSubmenus();
        this.close();
    }

    private _disposeSubmenuOf(item: any): void {
        const sub = this._submenuMap.get(item);
        if (sub) {
            sub.dispose();
            this._submenuMap.delete(item);
        }
        if (this._openSubmenuKey === item) this._openSubmenuKey = null;
    }

    _destroyItem(component: any): void {
        this._disposeSubmenuOf(component);
        super._destroyItem(component);
    }

    onBeforeDispose(): void {
        this.closeAllSubmenus();
        this.close();
        (this as any).clearGroups();
    }
}

MenuComponent.use(GroupSelectAbility);

export { MenuComponent };