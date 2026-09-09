import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DomEventsMap, ListenItem } from '@qimenjs/component-core';
import { NAVBAR_TPL } from './navbar-tpl';
import { Definitions } from '@/composable';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { SYSTEM_EVENTS } from '@/events';
import './navbar.css';

const NavbarComponentDefs: Definitions = {
    options: {
        companyName: null,
        logo: null,
        items: null,
        defaultItemOption: null,
        menuToggleIconCls: null,
    },
} as const;

class NavbarComponent extends Component {
    static type = 'navbar';
    get tpl(): TemplateDecl {
        return NAVBAR_TPL;
    }

    _itemInstances: any[] = [];
    _menuItemInstances: any[] = [];
    _menuPanel: HTMLElement | null = null;

    domEvents: DomEventsMap = {
        click: [{ path: 'menuToggle', handler: '_onMenuToggleClick' }],
    };

    listens: Array<ListenItem> = [
        { system: true, events: { [SYSTEM_EVENTS.WINDOW_RESIZE]: '_onWindowResize' } },
    ];

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

    _onMenuToggleClick(): void {
        if (this._menuPanel) {
            this._closeMenu();
        } else {
            this._openMenu();
        }
    }

    _onMenuToggleIconClsOptionChange(value: string, old: string) {
        this.toggleOptionCls('', value, old, 'menuToggleIcon');
    }

    _onWindowResize(data: any): void {
        const width = data?.width;
        if (typeof width !== 'number') return;
        if (width > 768 && this._menuPanel) {
            this._closeMenu();
        }
    }

    _openMenu(): void {
        const panel = document.createElement('div');
        panel.className = 'q-navbar__menu-panel';

        const items = this.getData('items') ?? [];
        const defaults = this.getData('defaultItemOption') ?? {};
        const mergedItems = items.map((item: any) => ({ ...defaults, ...item }));

        const groups: Record<string, any[]> = {};
        for (const item of mergedItems) {
            const dock = item.dock ?? 'right';
            if (!groups[dock]) groups[dock] = [];
            groups[dock].push(item);
        }

        const dockOrder = ['left', 'center', 'right'];
        let firstGroup = true;
        for (const dock of dockOrder) {
            const groupItems = groups[dock];
            if (!groupItems || groupItems.length === 0) continue;

            if (!firstGroup) {
                const separator = document.createElement('div');
                separator.className = 'q-navbar__menu-separator';
                panel.appendChild(separator);
            }
            firstGroup = false;

            for (const config of groupItems) {
                const itemEl = this._createMenuItem(config);
                if (itemEl) panel.appendChild(itemEl);
            }
        }

        const toggleEl = this.getNodeEl('menuToggle');
        if (toggleEl) {
            const rect = toggleEl.getBoundingClientRect();
            panel.style.position = 'absolute';
            panel.style.top = `${rect.bottom}px`;
            panel.style.left = '0px';
            panel.style.right = '0px';
        }

        document.body.appendChild(panel);
        this._menuPanel = panel;
    }

    _closeMenu(): void {
        if (this._menuPanel) {
            this._menuPanel.remove();
            this._menuPanel = null;
        }
        for (const instance of this._menuItemInstances) {
            if (typeof instance.dispose === 'function') {
                instance.dispose();
            }
        }
        this._menuItemInstances = [];
    }

    _createMenuItem(config: any): HTMLElement | null {
        const panel = document.createElement('div');
        const instance = this._instantiateItem(config, panel);
        if (!instance) return null;
        this._menuItemInstances.push(instance);
        return instance.el;
    }

    onBeforeDispose(): void {
        this._closeMenu();
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
