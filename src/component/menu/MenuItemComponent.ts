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
        this.setNodeText(value, 'text');
    }

    _onShortcutOptionChange(value: string): void {
        this.setNodeText(value, 'shortcut');
    }

    _onHasSubmenuOptionChange(value: boolean): void {
        value
            ? this.addCls('q-menu-item--has-submenu')
            : this.removeCls('q-menu-item--has-submenu');
        value ? this.removeCls('hidden', 'expand') : this.addCls('hidden', 'expand');
    }

    _onGroupOptionChange(value: string): void {
        if (value) {
            this.addCls('q-menu-item--grouped');
            this._applyGroupIcon();
        } else {
            this.removeCls('q-menu-item--grouped');
            this.removeCls('q-radio', 'icon');
            this.removeCls('q-checkbox', 'icon');
            this.removeCls('q-radio--checked', 'icon');
            this.removeCls('q-checkbox--checked', 'icon');
        }
        this._applyAria();
    },

    _onGroupModeOptionChange(value: string): void {
        if (value === 'checkbox') {
            this.addCls('q-menu-item--checkbox');
        } else {
            this.removeCls('q-menu-item--checkbox');
        }
        this._applyGroupIcon();
        this._applyAria();
    },

    _onCheckedOptionChange(value: boolean): void {
        this._applyGroupIcon();
        this._applyAria();
    },

    _onIconOptionChange(_value: string): void {}

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

    private _applyGroupIcon(): void {
        if (!this.group) return;

        const isCheckbox = this.groupMode === 'checkbox';
        const baseCls = isCheckbox ? 'q-checkbox' : 'q-radio';
        const otherCls = isCheckbox ? 'q-radio' : 'q-checkbox';
        const checkedCls = isCheckbox ? 'q-checkbox--checked' : 'q-radio--checked';
        const otherCheckedCls = isCheckbox ? 'q-radio--checked' : 'q-checkbox--checked';

        this.removeCls(otherCls, 'icon');
        this.removeCls(otherCheckedCls, 'icon');
        this.addCls(baseCls, 'icon');

        if (this.checked) {
            this.addCls(checkedCls, 'icon');
        } else {
            this.removeCls(checkedCls, 'icon');
        }
    }
}

MenuItemComponent.define(MenuItemComponentDefs);

export { MenuItemComponent };
export type MenuItemComponentInstance = InstanceType<typeof MenuItemComponent>;
