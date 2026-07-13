/**
 * MenuItemComponent 菜单项组件
 *
 * 独立组件，每个菜单项是一个组件实例。
 * 支持图标、文本、快捷键、禁用状态、子菜单。
 *
 * 模板内容项（由 withTemplate 自动生成 getter/setter）：
 * - menuItem:icon — 图标
 * - menuItem:text — 文本
 * - menuItem:shortcut — 快捷键文本
 * - menuItem:expand — 子菜单展开箭头（div > i 结构）
 *
 * 事件：
 * - click → handleClick（内部事件，触发外部 onSelect 回调）
 *
 * 子菜单：
 * - 通过 OverlayAbility 创建子 MenuComponent 浮层
 * - hover 时自动弹出，离开时自动关闭
 *
 * @example
 * ```js
 * const item = new MenuItemComponent({ text: '新建', icon: '📄', shortcut: 'Ctrl+N' });
 * item.onSelect = () => { ... };
 * ```
 */

import { TemplateComponent, OverlayAbility, MENU_ITEM_TEMPLATE } from '@qimenjs/component-core';
import { ExpandArrowAbility } from '@qimenjs/component-abilities';

/** 菜单项配置 */
export interface MenuItemProps {
    /** 菜单项文本 */
    text?: string;
    /** 图标（文本或 HTML） */
    icon?: string;
    /** 快捷键文本 */
    shortcut?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否有子菜单 */
    hasSubmenu?: boolean;
    /** 选中回调 */
    onSelect?: (item: MenuItemComponent) => void;
    /** 子菜单配置（hasSubmenu 为 true 时有效） */
    submenuProps?: Record<string, any>;
}

/**
 * MenuItemBase — 在 withTemplate 强类基础上，通过 with() 混入 OverlayAbility
 */
const MenuItemBase = TemplateComponent
    .withTemplate(MENU_ITEM_TEMPLATE)
    .with([OverlayAbility, ExpandArrowAbility]);

export class MenuItemComponent extends MenuItemBase {
    /** 是否禁用 */
    private _disabled: boolean = false;

    /** 是否有子菜单 */
    private _hasSubmenu: boolean = false;

    /** 选中回调 */
    onSelect?: (item: MenuItemComponent) => void;

    /** 子菜单配置 */
    submenuProps?: Record<string, any>;

    /** 子菜单 hover 延迟定时器 */
    private _submenuTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props?: MenuItemProps & Record<string, any>) {
        super(props);

        this.type = 'MenuItem';
        this.el.classList.add('q-menu-item');

        if (props?.text) this.text = props.text;
        if (props?.icon) this.icon = props.icon;
        if (props?.shortcut) this.shortcut = props.shortcut;
        if (props?.disabled) this._disabled = props.disabled;
        if (props?.hasSubmenu) this._hasSubmenu = props.hasSubmenu;
        if (props?.onSelect) this.onSelect = props.onSelect;
        if (props?.submenuProps) this.submenuProps = props.submenuProps;

        this.applyState();
        this.initExpandArrow({ arrowName: 'expand' });
        this.bindHoverEvents();
    }

    /** 是否禁用 */
    get disabled(): boolean { return this._disabled; }
    set disabled(value: boolean) {
        this._disabled = value;
        this.applyState();
    }

    /** 是否有子菜单 */
    get hasSubmenu(): boolean { return this._hasSubmenu; }
    set hasSubmenu(value: boolean) {
        this._hasSubmenu = value;
        this.applyState();
    }

    /** 内部事件：点击处理 */
    handleClick(): void {
        if (this._disabled) return;

        // 有子菜单时不触发 onSelect，由 hover 处理
        if (this._hasSubmenu) return;

        this.onSelect?.(this);
    }

    /** 应用状态到 DOM */
    private applyState(): void {
        this.el.classList.toggle('q-menu-item--disabled', this._disabled);
        this.el.classList.toggle('q-menu-item--has-submenu', this._hasSubmenu);

        // 展开箭头显隐
        const expandEl = this.nodeMap?.['menuItem']?.['expand']?.el as HTMLElement | null;
        if (expandEl) {
            expandEl.hidden = !this._hasSubmenu;
        }

        // 禁用时移除交互
        if (this._disabled) {
            this.el.setAttribute('aria-disabled', 'true');
        } else {
            this.el.removeAttribute('aria-disabled');
        }
    }

    /** 绑定 hover 事件，用于子菜单弹出 */
    private bindHoverEvents(): void {
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
    }

    /** 清除子菜单定时器 */
    private _clearSubmenuTimer(): void {
        if (this._submenuTimer) {
            clearTimeout(this._submenuTimer);
            this._submenuTimer = null;
        }
    }

    /** 打开子菜单 */
    openSubmenu(): void {
        if (!this._hasSubmenu) return;

        // 首次打开时创建子菜单浮层
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
    }

    /** 关闭子菜单 */
    closeSubmenu(): void {
        this.closeMenu?.();
    }

    update(props?: Partial<MenuItemProps> & Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.shortcut !== undefined) this.shortcut = props.shortcut;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.hasSubmenu !== undefined) this.hasSubmenu = props.hasSubmenu;
        if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
        if (props?.submenuProps !== undefined) this.submenuProps = props.submenuProps;
    }
}
