/**
 * OverflowMenuComponent 溢出菜单浮层组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * 检测宿主容器溢出状态，在容器边缘浮动显示触发按钮，
 * 点击弹出菜单显示溢出的子项。
 *
 * 职责：
 * - 监听宿主容器 scroll/resize/mutation，检测溢出状态
 * - 动态创建触发按钮，挂载到 OverlayRoot
 * - 触发按钮定位到容器边缘（通过 positionOverlay）
 * - 点击触发按钮 → 弹出 MenuComponent 显示溢出项
 * - 菜单通过调度中心管理
 */

import { Component } from '@qimenjs/component-core';
import { OverlayRoot } from '@/overlay/OverlayRoot';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { EventContextBuilder } from '@/context';
import { positionOverlay, type Placement } from '@/overlay/dispatch';
import { overlayDispatchCenter } from '@/overlay/dispatch';
import { TemplateRegistrar } from '@qimenjs/component-core';
import { ZIndexLevel, nextZIndex } from '@/component/z-index';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export type OverflowDirection = 'horizontal' | 'vertical';

export interface OverflowMenuItem {
    key: string;
    label: string;
    element?: HTMLElement;
    data?: any;
}

export interface OverflowMenuProps {
    anchor?: HTMLElement;
    direction?: OverflowDirection;
    menuOffset?: number;
    maxVisibleItems?: number;
}

class OverflowMenuComponent extends Component {
    static type = 'OverflowMenu';
    type = 'OverflowMenu';

    _anchor: HTMLElement | null = null;
    _direction: OverflowDirection = 'horizontal';
    _menuOffset: number = 0;
    _maxVisibleItems: number = 0;
    _triggerBtn: HTMLElement | null = null;
    _menuInstance: any = null;
    _isMenuOpen: boolean = false;
    _overflowItems: OverflowMenuItem[] = [];
    _resizeObserver: ResizeObserver | null = null;
    _mutationObserver: MutationObserver | null = null;
    _rafId: number = 0;
    _menuOverlayKey: string = '';

    onInitState() {
        return {
            _anchor: null as HTMLElement | null,
            _direction: 'horizontal' as OverflowDirection,
            _menuOffset: 0,
            _maxVisibleItems: 0,
            _triggerBtn: null as HTMLElement | null,
            _menuInstance: null as any,
            _isMenuOpen: false,
            _overflowItems: [] as OverflowMenuItem[],
            _resizeObserver: null as ResizeObserver | null,
            _mutationObserver: null as MutationObserver | null,
            _rafId: 0,
            _menuOverlayKey: '',
        };
    }

    _initOverflowMenu(props?: OverflowMenuProps): void {
        const anchor = props?.anchor;
        if (!anchor) return;

        this._anchor = anchor;
        this._direction = props?.direction ?? 'horizontal';
        this._menuOffset = props?.menuOffset ?? 0;
        this._maxVisibleItems = props?.maxVisibleItems ?? 0;

        this.el.classList.add(`q-overflow-menu-overlay--${this._direction}`);

        this._menuOverlayKey = `${this.id ?? 'comp'}:overflow-menu`;

        this._createTriggerBtn();
        this._bindEvents();
        this._recalcOverflowItems();

        this.onCleanup(() => {
            this._destroy();
        });
    }

    _createTriggerBtn(): void {
        const root = OverlayRoot.getInstance().getRoot();
        if (!root) return;

        const btn = document.createElement('div');
        btn.className = `q-overflow-menu__trigger q-overflow-menu__trigger--${this._direction}`;
        btn.hidden = true;
        btn.style.position = 'absolute';
        btn.style.zIndex = String(nextZIndex(ZIndexLevel.dropdown));
        btn.style.pointerEvents = 'auto';
        btn.innerHTML = '<i></i>';

        this.bind(btn, 'click');
        this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
            const domEvt = ctx?.data?.originalEvent ?? ctx?.data;
            domEvt?.stopPropagation?.();
            this._toggleMenu();
        });

        root.appendChild(btn);
        this._triggerBtn = btn;
    }

    _bindEvents(): void {
        if (!this._anchor) return;

        this._resizeObserver = new ResizeObserver(() => this._scheduleUpdate());
        this._resizeObserver.observe(this._anchor);

        const contentArea = this._anchor;
        this._mutationObserver = new MutationObserver(() => this._scheduleUpdate());
        this._mutationObserver.observe(contentArea, { childList: true });
    }

    _scheduleUpdate(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(() => {
            this._recalcOverflowItems();
            this._rafId = 0;
        });
    }

    _recalcOverflowItems(): void {
        if (!this._anchor) return;

        const containerRect = this._anchor.getBoundingClientRect();
        const children = Array.from(this._anchor.children) as HTMLElement[];

        const overflowItems: OverflowMenuItem[] = [];
        let firstOverflowIndex = children.length;

        if (this._maxVisibleItems > 0) {
            firstOverflowIndex = this._maxVisibleItems;
        } else {
            for (let i = 0; i < children.length; i++) {
                const childRect = children[i].getBoundingClientRect();
                const isOverflowing =
                    this._direction === 'horizontal'
                        ? childRect.right > containerRect.right
                        : childRect.bottom > containerRect.bottom;

                if (isOverflowing) {
                    firstOverflowIndex = i;
                    break;
                }
            }
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (i >= firstOverflowIndex) {
                child.hidden = true;
                overflowItems.push({
                    key: child.getAttribute('data-key') ?? `item-${i}`,
                    label: child.getAttribute('data-label') ?? child.textContent ?? `项 ${i + 1}`,
                    element: child,
                });
            } else {
                child.hidden = false;
            }
        }

        this._overflowItems = overflowItems;

        if (this._triggerBtn) {
            this._triggerBtn.hidden = overflowItems.length === 0;
            if (overflowItems.length > 0) {
                const placement: Placement = this._direction === 'horizontal' ? 'right' : 'bottom';
                positionOverlay(this._triggerBtn, this._anchor, placement, 0, false);
            }
        }

        this._anchor.classList.toggle(
            'q-overflow-menu-container--overflowing',
            overflowItems.length > 0
        );

        if (this._menuInstance) {
            this._menuInstance.setMenuItems?.(
                overflowItems.map(item => ({
                    key: item.key,
                    text: item.label,
                    onSelect: () => {
                        this.emit(
                            'overflowmenu',
                            {
                                key: item.key,
                                label: item.label,
                                element: item.element,
                            },
                            { source: this.eventKey }
                        );
                        this._closeMenu();
                    },
                }))
            );
        }

        if (this._isMenuOpen) {
            this._closeMenu();
        }
    }

    _toggleMenu(): void {
        if (this._isMenuOpen) {
            this._closeMenu();
        } else {
            this._openMenu();
        }
    }

    _openMenu(): void {
        if (!this._triggerBtn || !this._anchor) return;

        const menu = this._getOrCreateMenu();
        if (!menu) return;

        menu._anchor = this._triggerBtn;
        menu.hidden = false;

        const bus = OverlayEventBus.getInstance();
        bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${this._menuOverlayKey}:show`)
                .withType('show')
                .withSource(this._menuOverlayKey)
                .withData({
                    component: this,
                    anchor: this._triggerBtn,
                    overlay: menu,
                })
                .build()
        );

        this._triggerBtn.classList.add('q-overflow-menu__trigger--active');
        this._isMenuOpen = true;
    }

    _closeMenu(): void {
        if (!this._isMenuOpen) return;

        const bus = OverlayEventBus.getInstance();
        bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${this._menuOverlayKey}:hide`)
                .withType('hide')
                .withSource(this._menuOverlayKey)
                .withData({
                    component: this,
                    anchor: this._triggerBtn,
                })
                .build()
        );

        if (this._triggerBtn) {
            this._triggerBtn.classList.remove('q-overflow-menu__trigger--active');
        }

        this._isMenuOpen = false;
    }

    _getOrCreateMenu(): any {
        if (this._menuInstance) return this._menuInstance;

        const MenuClass = TemplateRegistrar.getInstance().get('Menu') as any;
        if (!MenuClass) return null;

        const placement: Placement = this._direction === 'horizontal' ? 'bottom' : 'right';
        this._menuInstance = new MenuClass({
            anchor: this._triggerBtn,
            placement,
            offset: this._menuOffset,
        });

        overlayDispatchCenter.register(this._menuOverlayKey, {
            type: 'Menu',
            trigger: 'manual',
            placement,
            offset: this._menuOffset,
        });

        return this._menuInstance;
    }

    _destroy(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);

        this._resizeObserver?.disconnect();
        this._mutationObserver?.disconnect();

        if (this._triggerBtn) {
            this._triggerBtn.remove();
            this._triggerBtn = null;
        }

        if (this._menuInstance) {
            this._menuInstance.dispose?.();
            this._menuInstance = null;
        }

        if (this._anchor) {
            const children = Array.from(this._anchor.children) as HTMLElement[];
            for (const child of children) {
                child.hidden = false;
            }
            this._anchor.classList.remove('q-overflow-menu-container--overflowing');
        }
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.direction !== undefined) this._direction = data.direction;
        if (data.menuOffset !== undefined) this._menuOffset = data.menuOffset;
        if (data.maxVisibleItems !== undefined) this._maxVisibleItems = data.maxVisibleItems;
        this._recalcOverflowItems();
    }
}

export { OverflowMenuComponent };
export type OverflowMenuComponentInstance = InstanceType<typeof OverflowMenuComponent>;
