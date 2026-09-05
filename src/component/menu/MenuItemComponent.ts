import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { MENU_ITEM_TPL } from './menu-item-tpl';
import { Definitions } from '@/composable';
import './menuitem.css';

export type MenuItemGroupMode = 'radio' | 'checkbox';

const MenuItemComponentDefs: Definitions = {
    options: {
        text: null,
        shortcut: null,
        icon: null,
        hasSubmenu: false,
        group: null,
        groupMode: 'radio',
        checked: false,
    },
    fields: {
        submenuProps: null,
    },
} as const;

class MenuItemComponent extends Component {
    static type = 'menu-item';
    get tpl(): TemplateDecl {
        return MENU_ITEM_TPL;
    }

    _onTextOptionChange(value: string): void {
        this._setNodeText('text', value);
    }

    _onShortcutOptionChange(value: string): void {
        this._setNodeText('shortcut', value);
    }

    _onHasSubmenuOptionChange(value: boolean): void {
        value ? this.addCls('q-menu-item--has-submenu') : this.removeCls('q-menu-item--has-submenu');
        value ? this.removeCls('hidden', 'expand') : this.addCls('hidden', 'expand');
    }

    _onGroupOptionChange(value: string): void {
        value ? this.addCls('q-menu-item--grouped') : this.removeCls('q-menu-item--grouped');
        this._applyIcon();
        this._applyAria();
    }

    _onGroupModeOptionChange(_value: string): void {
        this._applyIcon();
        this._applyAria();
    }

    _onCheckedOptionChange(value: boolean): void {
        value ? this.addCls('q-menu-item--checked') : this.removeCls('q-menu-item--checked');
        this._applyIcon();
        this._applyAria();
    }

    _onIconOptionChange(_value: string): void {
        this._applyIcon();
    }

    select(): boolean {
        if (this.disable) return false;
        if (this.hasSubmenu) return false;

        if (this.group) {
            if (this.groupMode === 'checkbox') {
                this.checked = !this.checked;
            } else {
                if (!this.checked) {
                    this.checked = true;
                }
            }
        }

        return true;
    }

    setExpandArrow(state: 'expanded' | 'collapsed'): void {
        if (state === 'expanded') {
            this.addCls('q-expand-arrow--expanded', 'expand');
            this.removeCls('q-expand-arrow--collapsed', 'expand');
        } else {
            this.removeCls('q-expand-arrow--expanded', 'expand');
            this.addCls('q-expand-arrow--collapsed', 'expand');
        }
    }

    private _applyIcon(): void {
        const el = this.getNodeEl('icon');
        if (!el) return;

        if (this.group) {
            if (this.groupMode === 'radio') {
                el.textContent = this.checked ? '●' : '○';
            } else {
                el.textContent = this.checked ? '☑' : '☐';
            }
        } else if (this.icon) {
            el.textContent = this.icon;
        } else {
            el.textContent = '';
        }
    }

    private _applyAria(): void {
        if (this.group) {
            this.setAttributes({
                role: this.groupMode === 'radio' ? 'menuitemradio' : 'menuitemcheckbox',
                'aria-checked': String(this.checked),
            });
        } else {
            this.removeAttributes(['role', 'aria-checked']);
        }
    }
}

MenuItemComponent.define(MenuItemComponentDefs);

export { MenuItemComponent };
export type MenuItemComponentInstance = InstanceType<typeof MenuItemComponent>;
