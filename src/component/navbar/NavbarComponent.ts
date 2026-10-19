import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { NAVBAR_TPL } from './navbar-tpl';
import { Definitions } from '@/composable';
import { createItemFromDef } from '../container/resolve';
import { DropdownComponent } from '../dropdown/DropdownComponent';
import { SYSTEM_EVENTS, systemEventBus } from '@/events';
import './navbar.css';

const NavbarComponentDefs: Definitions = {
    options: {
        companyName: null,
        logo: null,
        items: null,
        defaultItemOption: null,
        menu: null,
        fixed: false,
    },
} as const;

class NavbarComponent extends Component {
    static type = 'navbar';
    get tpl(): TemplateDecl {
        return NAVBAR_TPL;
    }

    _itemInstances: any[] = [];
    _menuDropdown: InstanceType<typeof DropdownComponent> | null = null;
    _unbindWindowResize: (() => void) | null = null;

    onAfterInit(): void {
        const logo = this.getData('logo');
        if (logo) {
            const logoEl = this.getNodeEl('logo');
            if (logoEl) logoEl.textContent = logo;
        }

        const companyName = this.getData('companyName');
        if (companyName) {
            this.setNodeText(companyName, 'company');
        }

        const items = this.getData('items');
        if (items && Array.isArray(items)) {
            this._renderItems(items);
        }

        const menuData = this.getData('menu');
        if (menuData) {
            this._createMenuDropdown(menuData);
        }

        this._syncMenuToggle();

        this._unbindWindowResize = systemEventBus.on(SYSTEM_EVENTS.WINDOW_RESIZE, () => {
            this._syncMenuToggle();
        });
    }

    _syncMenuToggle(): void {
        const dropdown = this._menuDropdown;
        if (!dropdown) return;
        const narrow = window.innerWidth <= 768;
        dropdown.hidden = !narrow;
        if (!narrow) dropdown.hidePopover();
    }

    _createMenuDropdown(menuData: any): void {
        const popover = menuData.popover
            ? { anchor: 'self', type: 'multi-menu', ...menuData.popover }
            : undefined;

        if (popover && !popover.options?.items) {
            const items = (this.getData('items') ?? [])
                .map(
                    ({
                        dock: _dock,
                        type,
                        offIcon,
                        onIcon,
                        iconCls,
                        hint,
                        text,
                        action,
                        popover: itemPopover,
                        mobileMenu,
                        ...rest
                    }: any) => {
                        if (mobileMenu === false) return null;

                        if (mobileMenu && typeof mobileMenu === 'object') {
                            return {
                                ...mobileMenu,
                                action: mobileMenu.action ?? action,
                                mobileMenu,
                            };
                        }

                        if (type === 'toggle') {
                            return { text: hint ?? '', icon: offIcon ?? onIcon, action };
                        }
                        if (type === 'dropdown') {
                            const subItems = itemPopover?.options?.items;
                            return subItems
                                ? {
                                      text: hint ?? '',
                                      icon: iconCls,
                                      action,
                                      mobileMenu: { items: subItems },
                                  }
                                : { text: hint ?? '', icon: iconCls, action };
                        }
                        if (type === 'href') {
                            return { text, action, ...rest };
                        }
                        return { type, text, action, ...rest };
                    }
                )
                .filter(Boolean);
            popover.options = { ...popover.options, items };
        }

        const config = {
            ghost: true,
            iconCls: 'q-navbar__toggle-icon',
            classes: 'q-navbar__toggle',
            size: 'sm',
            arrowHidden: true,
            popover,
        };
        this._menuDropdown = new DropdownComponent(config);
        this.el!.insertBefore(this._menuDropdown.el!, this.el!.firstChild);
    }

    _renderItems(items: any[]): void {
        const defaults = this.getData('defaultItemOption') ?? {};
        for (const config of items) {
            this._createItem(typeof config === 'string' ? config : { ...defaults, ...config });
        }
    }

    /**
     * 创建 navbar item — 统一走 Container 四路解析
     *
     * - string：HTML 内容（@ 前缀 i18n）
     * - { type: 组件类|注册名|模板, ...props }：组件或模板
     * - TemplateDecl：纯 DOM 模板
     * dock 字段只决定落位容器（leftItems/centerItems/rightItems），不参与解析。
     */
    _createItem(config: any): any {
        const dock = typeof config === 'string' ? 'right' : (config.dock ?? 'right');
        const containerName = `${dock}Items`;
        const container = this.getNodeEl(containerName);
        if (!container) return null;

        let item: any;
        let itemName: string | undefined;
        if (typeof config === 'string') {
            item = createItemFromDef(this, config);
        } else {
            const { dock: _dock, ...def } = config;
            item = createItemFromDef(this, def);
            itemName = config.action ?? config.text;
        }
        if (!item?.el) return null;

        container.appendChild(item.el);

        if (itemName) {
            this._setComponent(itemName, item);
        }

        this._itemInstances.push(item);
        return item;
    }

    _onFixedOptionChange(value: boolean) {
        this.toggleCls('q-navbar--fixed', value);
    }

    onBeforeDispose(): void {
        this._unbindWindowResize?.();
        this._unbindWindowResize = null;
        if (this._menuDropdown) {
            this._menuDropdown.dispose();
            this._menuDropdown = null;
        }
        for (const item of this._itemInstances) {
            if (typeof item?.dispose === 'function') {
                item.dispose();
            } else if (item?.el?.parentNode) {
                item.el.parentNode.removeChild(item.el);
            }
        }
        this._itemInstances = [];
    }
}

NavbarComponent.define(NavbarComponentDefs);
export { NavbarComponent };
