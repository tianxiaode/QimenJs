/**
 * MenuComponent 菜单组件
 *
 * 从 ItemGroupStaticComponent 派生，通过 domEvents 集中处理子项事件，
 * 委托 MenuItemComponent.select() / setExpandArrow() 执行状态变更。
 *
 * domEvents 路径：
 * - 'MenuItem' → 点击菜单项、鼠标进入/离开菜单项
 *
 * 子菜单支持（hover 浮层，trigger:'manual' + enter/leave timer）：
 * - item 配置 popover: { options: { items: [...] } } 时，hover 该菜单项弹出子菜单
 * - MenuComponent 通过 showPopover/hidePopover 手动控制 PopoverAbility 的浮层显隐
 * - 保留 120ms open delay / 300ms close delay，防止鼠标移动误关
 * - 支持任意层嵌套（demo 演示 3 层）
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { GroupSelectAbility } from '@qimenjs/component-abilities';
import { DomEventsMap } from '@qimenjs/component-core';
import './menu.css';

class MenuComponent extends ItemGroupStaticComponent {
    static type = 'menu';
    defaultItemType: string = 'menu-item';

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
            path: '[items]',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['select', '[action]'],
        },
        enter: { path: '[items]', handler: '_onItemEnter' },
        leave: { path: '[items]', handler: '_onItemLeave' },
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

        if (!item.popover) {
            this.close();
        }
    }

    _onItemEnter(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item) return;

        window.clearTimeout(this._leaveTimer);

        if (!this._isOwnItem(item)) return;

        if (item === this._openSubmenuKey) return;

        if (item.popover && !item.disable) {
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

        if (item.popover) {
            item.setExpandArrow('collapsed');
            if (item !== this._openSubmenuKey) {
                this._scheduleClose(item);
            }
        }
    }

    setItems(datas: Record<string, any>[]): void {
        const defaultPlacement =
            this.direction === 'horizontal' ? 'bottom-start' : 'right-start';
        const processedDatas = datas.map((data) => {
            if (!data?.popover) return data;
            return {
                ...data,
                popover: {
                    type: 'menu',
                    trigger: 'manual',
                    anchor: 'self',
                    placement: defaultPlacement,
                    ...data.popover,
                },
            };
        });

        super.setItems(processedDatas);

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (processedDatas[i]?.popover) {
                item.addCls('q-menu-item--has-submenu');
                item.removeCls('hidden', 'expand');
                item.setExpandArrow('collapsed');
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
        const placement = this.placement ?? this.rawOptions?.placement;
        this._showOverlay({ anchor, placement });
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
        if (!item.popover) return;
        if (this._openSubmenuKey === item) return;

        this._openSubmenuKey = item;
        item.showPopover();

        const sub = item._getPopoverInstance?.();
        if (sub && !sub._chainSelectBound) {
            sub._chainSelectBound = true;
            sub.on('select', (data: any) => {
                const payload = data?.data ?? data;
                this.emit('select', payload);
                this._closeSubmenuChain(item);
            });
        }
    }

    private _closeSubmenu(item: any): void {
        const sub = item._getPopoverInstance?.();
        if (sub) {
            sub.closeAllSubmenus();
        }
        item.hidePopover();
        if (this._openSubmenuKey === item) {
            this._openSubmenuKey = null;
        }
    }

    closeAllSubmenus(): void {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.popover) {
                this._closeSubmenu(item);
            }
        }
        this._pendingItem = null;
    }

    private _closeSubmenuChain(item: any): void {
        const sub = item._getPopoverInstance?.();
        if (sub) {
            sub.closeAllSubmenus();
        }
        item.hidePopover();
        this.closeAllSubmenus();
        if (this.isOpen) {
            this.close();
        }
    }

    onBeforeDispose(): void {
        this.closeAllSubmenus();
        this.close();
        (this as any).clearGroups();
    }
}

MenuComponent.use(GroupSelectAbility);

export { MenuComponent };
