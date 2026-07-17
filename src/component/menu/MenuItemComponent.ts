/**
 * MenuItemComponent 菜单项组件
 *
 * 独立组件，每个菜单项是一个组件实例。
 * 支持图标、文本、快捷键、禁用状态、子菜单、分组选中。
 *
 * 模板节点：
 * - content — 整行可点击区域（事件：click → onClick）
 * - icon — 图标（分组模式下自动渲染选中指示符，与自定义 icon 互斥）
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
 */

import { TemplateComponent, OverlayAbility } from '@qimenjs/component-core';
import { ExpandArrowAbility } from '@qimenjs/component-abilities';
import { IconComponent } from '../icon/IconComponent';

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
    onSelect?: (item: any) => void;
    submenuProps?: Record<string, any>;
}

const MenuItemBase = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                name: 'content',
                events: { click: { handler: true } },
                className: 'q-menu-item__content',
                children: [
                    { name: 'icon', type: IconComponent, className: 'q-menu-item__icon' },
                    { tag: 'span', name: 'text', className: 'q-menu-item__text' },
                    { tag: 'span', name: 'shortcut', className: 'q-menu-item__shortcut' },
                    {
                        tag: 'div',
                        name: 'expand',
                        className: 'q-expand-arrow q-expand-arrow--collapsed',
                        hidden: true,
                        children: [{ tag: 'i' }],
                    },
                ],
            },
        ],
    },
    body: {
        type: 'MenuItem',

        _disabled: false,
        _hasSubmenu: false,
        _group: '',
        _groupMode: 'radio' as MenuItemGroupMode,
        _checked: false,
        _userIcon: '',
        onSelect: null as ((item: any) => void) | null,
        submenuProps: null as Record<string, any> | null,
        _submenuTimer: null as ReturnType<typeof setTimeout> | null,

        forwards: {
            icon: 'icon',
        },

        _initMenuItem(props?: MenuItemProps & Record<string, any>): void {
            this.el.classList.add('q-menu-item');

            if (props?.text) this.text = props.text;
            if (props?.icon) this._userIcon = props.icon;
            if (props?.shortcut) this.shortcut = props.shortcut;
            if (props?.disabled) this._disabled = props.disabled;
            if (props?.hasSubmenu) this._hasSubmenu = props.hasSubmenu;
            if (props?.group) this._group = props.group;
            if (props?.groupMode) this._groupMode = props.groupMode;
            if (props?.checked) this._checked = props.checked;
            if (props?.onSelect) this.onSelect = props.onSelect;
            if (props?.submenuProps) this.submenuProps = props.submenuProps;

            this._applyState();
            this.initExpandArrow({ arrowName: 'expand' });
            this._bindHoverEvents();
        },

        get disabled(): boolean {
            return this._disabled;
        },
        set disabled(value: boolean) {
            this._disabled = value;
            this._applyState();
        },

        get hasSubmenu(): boolean {
            return this._hasSubmenu;
        },
        set hasSubmenu(value: boolean) {
            this._hasSubmenu = value;
            this._applyState();
        },

        get group(): string {
            return this._group;
        },
        set group(value: string) {
            this._group = value;
            this._applyState();
        },

        get groupMode(): MenuItemGroupMode {
            return this._groupMode;
        },
        set groupMode(value: MenuItemGroupMode) {
            this._groupMode = value;
            this._applyState();
        },

        get checked(): boolean {
            return this._checked;
        },
        set checked(value: boolean) {
            this._checked = value;
            this._applyState();
        },

        onClick(): void {
            if (this._disabled) return;
            if (this._hasSubmenu) return;

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

            if (this.eventKey) {
                this.emit('click', undefined, { source: this.eventKey });
                this.emit('select', undefined, { source: this.eventKey });
            }

            this.onSelect?.(this);
        },

        _applyState(): void {
            this.el.classList.toggle('q-menu-item--disabled', this._disabled);
            this.el.classList.toggle('q-menu-item--has-submenu', this._hasSubmenu);
            this.el.classList.toggle('q-menu-item--checked', this._checked);
            this.el.classList.toggle('q-menu-item--grouped', !!this._group);

            if (this._group) {
                this._renderGroupIndicator();
            } else if (this._userIcon) {
                this._setIcon(this._userIcon);
            }

            const expandEl = this.nodeMap?.expand?.el as HTMLElement | null;
            if (expandEl) {
                expandEl.hidden = !this._hasSubmenu;
            }

            if (this._disabled) {
                this.el.setAttribute('aria-disabled', 'true');
            } else {
                this.el.removeAttribute('aria-disabled');
            }

            if (this._group) {
                this.el.setAttribute(
                    'role',
                    this._groupMode === 'radio' ? 'menuitemradio' : 'menuitemcheckbox'
                );
                this.el.setAttribute('aria-checked', String(this._checked));
            } else {
                this.el.removeAttribute('role');
                this.el.removeAttribute('aria-checked');
            }
        },

        _renderGroupIndicator(): void {
            if (this._groupMode === 'radio') {
                this._setIcon(this._checked ? '●' : '○');
            } else {
                this._setIcon(this._checked ? '☑' : '☐');
            }
        },

        _setIcon(value: string): void {
            const iconComponent = this.icon;
            if (iconComponent?.nodeMap?.content?.el) {
                iconComponent.nodeMap.content.el.innerHTML = value;
            }
        },

        _bindHoverEvents(): void {
            this.el.addEventListener('mouseenter', () => {
                this._clearSubmenuTimer();

                if (this._hasSubmenu && !this._disabled) {
                    this._submenuTimer = setTimeout(() => {
                        this.openSubmenu();
                    }, 150);
                }
            });

            this.el.addEventListener('mouseleave', () => {
                this._clearSubmenuTimer();

                if (this._hasSubmenu) {
                    this._submenuTimer = setTimeout(() => {
                        this.closeSubmenu();
                    }, 200);
                }
            });
        },

        _clearSubmenuTimer(): void {
            if (this._submenuTimer) {
                clearTimeout(this._submenuTimer);
                this._submenuTimer = null;
            }
        },

        openSubmenu(): void {
            if (!this._hasSubmenu) return;

            if (typeof this.openMenu !== 'function') {
                this.createOverlay({
                    prefix: 'menu',
                    overlayProps: {
                        placement: 'right',
                        ...this.submenuProps,
                    },
                });
            }

            this.openMenu?.();
        },

        closeSubmenu(): void {
            this.closeMenu?.();
        },

        update(props?: Partial<MenuItemProps> & Record<string, any>): void {
            if (props?.text !== undefined) this.text = props.text;
            if (props?.icon !== undefined) this._userIcon = props.icon;
            if (props?.shortcut !== undefined) this.shortcut = props.shortcut;
            if (props?.disabled !== undefined) this.disabled = props.disabled;
            if (props?.hasSubmenu !== undefined) this.hasSubmenu = props.hasSubmenu;
            if (props?.group !== undefined) this.group = props.group;
            if (props?.groupMode !== undefined) this.groupMode = props.groupMode;
            if (props?.checked !== undefined) this.checked = props.checked;
            if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
            if (props?.submenuProps !== undefined) this.submenuProps = props.submenuProps;
        },
    },
}).with([OverlayAbility, ExpandArrowAbility]);

export let MenuItemComponent = MenuItemBase;

export type MenuItemComponent = InstanceType<typeof MenuItemBase>;
