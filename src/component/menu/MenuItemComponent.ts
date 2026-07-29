/**
 * MenuItemComponent 菜单项组件
 *
 * 独立组件，每个菜单项是一个组件实例。
 * 支持图标、文本、快捷键、禁用状态、子菜单、分组选中。
 *
 * 模板节点：
 * - content — 整行可点击区域
 * - icon — 图标（DOM 节点），分组模式下自动渲染选中指示符，与自定义 icon 互斥
 * - text — 文本
 * - shortcut — 快捷键文本
 * - expand — 子菜单展开箭头
 *
 * 分组选中：
 * - group 指定所属分组（同组互斥或共存）
 * - groupMode 控制分组模式：'radio'（单选）、'checkbox'（多选）
 * - checked 表示当前选中状态
 * - 选中指示符复用 icon 位：radio 用 ●/○，checkbox 用 ☑/☐
 * - 自定义 icon 与分组指示符互斥：有 group 时优先显示指示符
 *
 * 子菜单：通过 OverlayEventBus 通知调度中心打开/关闭子菜单浮层
 *
 * 事件处理由 MenuComponent 通过 domEvents 集中委托，
 * 本组件只提供 select() / setExpandArrow() 等公开方法供父组件调用。
 */

import { Component } from '@qimenjs/component-core';

export type MenuItemGroupMode = 'radio' | 'checkbox';

export interface MenuItemProps {
    text?: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    hasSubmenu?: boolean;
    group?: string;
    groupMode?: MenuItemGroupMode;
    checked?: boolean;
    submenuProps?: Record<string, any>;
}

class MenuItemComponent extends Component {
    _disabled: boolean = false;
    _hasSubmenu: boolean = false;
    _group: string = '';
    _groupMode: MenuItemGroupMode = 'radio';
    _checked: boolean = false;
    _userIcon: string = '';
    submenuProps: Record<string, any> | null = null;

    onAfterInit(props?: MenuItemProps & Record<string, any>): void {
        this._initMenuItem(props);
    }

    _initMenuItem(props?: MenuItemProps & Record<string, any>): void {
        this.addCls('q-menu-item');

        if (props?.text) this.text = props.text;
        if (props?.icon) this._userIcon = props.icon;
        if (props?.shortcut) this.shortcut = props.shortcut;
        if (props?.disabled) this._disabled = props.disabled;
        if (props?.hasSubmenu) this._hasSubmenu = props.hasSubmenu;
        if (props?.group) this._group = props.group;
        if (props?.groupMode) this._groupMode = props.groupMode;
        if (props?.checked) this._checked = props.checked;
        if (props?.submenuProps) this.submenuProps = props.submenuProps;

        this._applyState();

        if (this._hasSubmenu) {
            this.submenu = {
                type: 'Menu',
                trigger: 'hover',
                placement: 'right',
                showDelay: 150,
                hideDelay: 200,
                data: () => this.submenuProps ?? {},
            };
        }
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(value: boolean) {
        this._disabled = value;
        this._applyState();
    }

    get hasSubmenu(): boolean {
        return this._hasSubmenu;
    }
    set hasSubmenu(value: boolean) {
        this._hasSubmenu = value;
        this._applyState();
    }

    get group(): string {
        return this._group;
    }
    set group(value: string) {
        this._group = value;
        this._applyState();
    }

    get groupMode(): MenuItemGroupMode {
        return this._groupMode;
    }
    set groupMode(value: MenuItemGroupMode) {
        this._groupMode = value;
        this._applyState();
    }

    get checked(): boolean {
        return this._checked;
    }
    set checked(value: boolean) {
        this._checked = value;
        this._applyState();
    }

    /**
     * 选中/切换 — 由 MenuComponent domEvents 委托调用
     *
     * 处理分组 toggle 逻辑，返回 true 表示有效选中（非禁用、非子菜单项）
     */
    select(): boolean {
        if (this._disabled) return false;
        if (this._hasSubmenu) return false;

        if (this._group) {
            if (this._groupMode === 'checkbox') {
                this._checked = !this._checked;
            } else {
                if (!this._checked) {
                    this._checked = true;
                }
            }
            this._applyState();
        }

        return true;
    }

    /**
     * 设置展开箭头状态 — 由 MenuComponent domEvents 委托调用
     */
    setExpandArrow(state: 'expanded' | 'collapsed'): void {
        if (state === 'expanded') {
            this.addCls('q-expand-arrow--expanded', 'expand');
            this.removeCls('q-expand-arrow--collapsed', 'expand');
        } else {
            this.removeCls('q-expand-arrow--expanded', 'expand');
            this.addCls('q-expand-arrow--collapsed', 'expand');
        }
    }

    _applyState(): void {
        if (this._disabled) this.addCls('q-menu-item--disabled');
        else this.removeCls('q-menu-item--disabled');

        if (this._hasSubmenu) this.addCls('q-menu-item--has-submenu');
        else this.removeCls('q-menu-item--has-submenu');

        if (this._checked) this.addCls('q-menu-item--checked');
        else this.removeCls('q-menu-item--checked');

        if (this._group) this.addCls('q-menu-item--grouped');
        else this.removeCls('q-menu-item--grouped');

        if (this._group) {
            this._renderGroupIndicator();
        } else if (this._userIcon) {
            this._setIcon(this._userIcon);
        }

        this.setNodeHidden(!this._hasSubmenu, 'expand');

        this.ariaDisabled = this._disabled ? 'true' : false;

        if (this._group) {
            this.role = this._groupMode === 'radio' ? 'menuitemradio' : 'menuitemcheckbox';
            this.ariaChecked = String(this._checked);
        } else {
            this.role = false;
            this.ariaChecked = false;
        }
    }

    _renderGroupIndicator(): void {
        if (this._groupMode === 'radio') {
            this._setIcon(this._checked ? '●' : '○');
        } else {
            this._setIcon(this._checked ? '☑' : '☐');
        }
    }

    _setIcon(value: string): void {
        this.icon = value;
    }

    update(props?: Partial<MenuItemProps> & Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this._userIcon = props.icon;
        if (props?.shortcut !== undefined) this.shortcut = props.shortcut;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.hasSubmenu !== undefined) this.hasSubmenu = props.hasSubmenu;
        if (props?.group !== undefined) this.group = props.group;
        if (props?.groupMode !== undefined) this.groupMode = props.groupMode;
        if (props?.checked !== undefined) this.checked = props.checked;
        if (props?.submenuProps !== undefined) this.submenuProps = props.submenuProps;
    }
}

export { MenuItemComponent };
export type MenuItemComponentInstance = InstanceType<typeof MenuItemComponent>;
