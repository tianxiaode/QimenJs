/**
 * MenuComponent 浮层菜单组件
 *
 * 弹出式菜单容器，内置 ItemGroup 管理菜单项。
 * 复用 OverlayHostAbility 实现浮层协议（open/close/reposition）。
 *
 * 默认使用 MenuItem 作为子项组件，可通过 itemType 替换。
 *
 * @example
 * ```js
 * // 默认 MenuItem
 * { type: 'Menu', items: [{ text: '复制' }, { text: '粘贴' }] }
 *
 * // 替换子项组件
 * { type: 'Menu', itemType: 'ColorItem', items: [{ color: '#f00' }] }
 *
 * // 运行时增删
 * menu.itemGroup.add({ text: '新增' });
 * menu.itemGroup.removeAt(1);
 * ```
 */

import { TemplateComponent, MENU_TEMPLATE } from '@qimenjs/component-core';
import { OverlayHostAbility } from '@qimenjs/component-abilities';
import type { Placement } from '@qimenjs/component-core';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

/** 菜单配置 */
export interface MenuProps {
    /** 锚点元素（由 OverlayAbility 自动注入） */
    anchor?: HTMLElement;
    /** 弹出方向，默认 'bottom' */
    placement?: Placement;
    /** 浮层与锚点间距，默认 4 */
    offset?: number;
    /** 子项组件类型，默认 'MenuItem' */
    itemType?: string;
    /** 菜单项数据 */
    items?: Record<string, any>[];
}

/**
 * MenuBase — withTemplate + OverlayHostAbility
 */
const MenuBase = TemplateComponent
    .withTemplate(MENU_TEMPLATE)
    .with([OverlayHostAbility]);

export class MenuComponent extends MenuBase {
    /** 是否已打开 */
    private _isOpen: boolean = false;

    /** 内置 ItemGroup */
    private _itemGroup!: ItemGroupComponent;

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

        // 创建内置 ItemGroup，默认 MenuItem，可替换
        this._itemGroup = new ItemGroupComponent({
            itemType: props?.itemType ?? 'MenuItem',
            direction: 'vertical',
            items: props?.items,
        });

        // 挂载到 menu:default 容器
        const container = this.nodeMap?.['menu']?.['default']?.el;
        if (container) {
            container.appendChild(this._itemGroup.el);
        }
    }

    /** 内置 ItemGroup 实例 */
    get itemGroup(): ItemGroupComponent {
        return this._itemGroup;
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
        if (this._itemGroup) {
            this._itemGroup.dispose();
        }
        super.dispose();
    }
}
