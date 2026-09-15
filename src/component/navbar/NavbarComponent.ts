import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { NAVBAR_TPL } from './navbar-tpl';
import { Definitions } from '@/composable';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { DropdownComponent } from '../dropdown/DropdownComponent';
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

    get earlyOptionKeys(): string[] {
        return [...super.earlyOptionKeys, 'defaultItemOption'];
    }

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
    }

    _createMenuDropdown(menuData: any): void {
        const popover = menuData.popover ? { anchor: 'self', ...menuData.popover } : undefined;

        if (popover && !popover.options?.items) {
            const items = (this.getData('items') ?? []).map(({ dock: _dock, ...rest }: any) => rest);
            popover.options = { ...popover.options, items };
        }

        const config = {
            ghost: true,
            iconCls: 'q-navbar__toggle-icon',
            classes: 'q-navbar__toggle',
            size: 'sm',
            popover,
        };
        this._menuDropdown = new DropdownComponent(config);
        this._menuDropdown.setNodeHidden(true, 'dropIcon');
        this.el!.insertBefore(this._menuDropdown.el!, this.el!.firstChild);
    }

    _renderItems(items: any[]): void {
        const defaults = this.getData('defaultItemOption') ?? {};
        for (const config of items) {
            this._createItem({ ...defaults, ...config });
        }
    }

    _createItem(config: any): any {
        const dock = config.dock ?? 'right';
        const containerName = `${dock}Items`;
        const container = this.getNodeEl(containerName);
        if (!container) return null;

        const instance = this._instantiateItem(config, container);
        if (!instance) return null;

        const itemName = config.action ?? config.text;
        if (itemName) {
            this._setComponent(itemName, instance);
        }

        this._itemInstances.push(instance);
        return instance;
    }

    _instantiateItem(config: any, container: HTMLElement): any {
        const type = config.type;
        const props = { ...config };
        delete props.type;
        delete props.dock;

        if (typeof type === 'function') {
            const instance = new type(props);
            container.appendChild(instance.el);
            return instance;
        }

        if (typeof type === 'string') {
            const ItemClass = ComponentRegistrar.getInstance().get(type);
            if (!ItemClass) return null;
            const instance = new ItemClass(props);
            container.appendChild(instance.el!);
            return instance;
        }

        if (type && typeof type === 'object' && ('tag' in type || 'children' in type)) {
            return this._createSlotComponent(type, container);
        }

        return null;
    }

    _onFixedOptionChange(value: boolean) {
        this.toggleCls('q-navbar--fixed', value);
    }

    onBeforeDispose(): void {
        if (this._menuDropdown) {
            this._menuDropdown.dispose();
            this._menuDropdown = null;
        }
        for (const instance of this._itemInstances) {
            if (typeof instance.dispose === 'function') {
                instance.dispose();
            }
        }
        this._itemInstances = [];
    }
}

NavbarComponent.define(NavbarComponentDefs);
export { NavbarComponent };