/**
 * MenuComponent 浮层菜单组件
 *
 * 弹出式菜单容器，复用 OverlayHostAbility 实现浮层协议（open/close/reposition）。
 * 通过 MenuItemManageAbility 管理菜单项的增删改和池化复用。
 *
 * 使用方式：
 * 1. 宿主通过 OverlayAbility.createOverlay({ prefix: 'menu' }) 创建菜单浮层
 * 2. 宿主上自动生成 openMenu/closeMenu/positionMenu 委托方法
 * 3. 菜单项通过 setMenuItems 配置，支持池化复用
 *
 * @example
 * ```js
 * // 宿主创建菜单浮层
 * button.createOverlay({ prefix: 'menu' });
 * button.openMenu();
 *
 * // 配置菜单项
 * menu.setMenuItems([
 *     { text: '新建', icon: '📄', shortcut: 'Ctrl+N', onSelect: () => {} },
 *     { text: '打开', icon: '📂' },
 *     { text: '保存', icon: '💾', hasSubmenu: true },
 * ]);
 * ```
 */

import { TemplateComponent, MENU_TEMPLATE } from '@qimenjs/component-core';
import { OverlayHostAbility, MenuItemManageAbility, type MenuItemConfig } from '@qimenjs/component-abilities';
import type { Placement } from '@qimenjs/component-core';

/** 菜单配置 */
export interface MenuProps {
    /** 锚点元素（由 OverlayAbility 自动注入） */
    anchor?: HTMLElement;
    /** 弹出方向，默认 'bottom' */
    placement?: Placement;
    /** 浮层与锚点间距，默认 4 */
    offset?: number;
    /** 菜单项配置 */
    items?: MenuItemConfig[];
}

/**
 * MenuBase — withTemplate + OverlayHostAbility + MenuItemManageAbility
 */
const MenuBase = TemplateComponent
    .withTemplate(MENU_TEMPLATE)
    .with([OverlayHostAbility, MenuItemManageAbility]);

export class MenuComponent extends MenuBase {
    /** 是否已打开 */
    private _isOpen: boolean = false;

    /** 点击外部关闭的监听器 */
    private _documentClickHandler: ((e: MouseEvent) => void) | null = null;

    constructor(props?: MenuProps & Record<string, any>) {
        super(props);

        this.type = 'Menu';
        this.el.classList.add('q-menu');

        // 初始化浮层宿主（z-index、定位、挂载）
        this.initOverlayHost({
            placement: props?.placement,
            offset: props?.offset,
        });

        // 保存锚点引用
        if (props?.anchor) this._anchor = props.anchor;

        // 初始化菜单项
        if (props?.items) {
            this.setMenuItems(props.items);
        }
    }

    /** 是否已打开 */
    get isOpen(): boolean { return this._isOpen; }

    // ─── 浮层协议 ───

    /**
     * 打开菜单
     *
     * 挂载到 OverlayRoot，定位到锚点，设置 z-index，绑定点击外部关闭
     */
    open(): void {
        if (this._isOpen) return;

        // 挂载到 OverlayRoot
        this.openOverlay();

        // 定位
        this.positionOverlay();

        // z-index
        this.acquireZIndex();

        // 显示
        this.el.style.display = '';
        this._isOpen = true;

        // 点击外部关闭
        this._documentClickHandler = (e: MouseEvent) => {
            if (!this.el.contains(e.target as Node)) {
                this.close();
            }
        };
        document.addEventListener('mousedown', this._documentClickHandler);
    }

    /**
     * 关闭菜单
     *
     * 隐藏菜单，从 OverlayRoot 移除，释放 z-index，解绑事件
     */
    close(): void {
        if (!this._isOpen) return;

        this.el.style.display = 'none';
        this._isOpen = false;

        // 释放 z-index
        this.releaseZIndex();

        // 从 OverlayRoot 移除
        this.closeOverlay();

        // 解绑点击外部关闭
        if (this._documentClickHandler) {
            document.removeEventListener('mousedown', this._documentClickHandler);
            this._documentClickHandler = null;
        }
    }

    // ─── 销毁 ───

    dispose(): void {
        this.close();
        this.disposeAllMenuItems();
        super.dispose();
    }
}
