/**
 * OverlayAbility — 浮层能力
 *
 * 为浮动组件提供浮层（overlay）操作工具：
 * - _showOverlay / _hideOverlay — 供组件 show/hide 调用的内部方法
 * - repositionOverlay — 重新定位
 * - mountToOverlay / unmountFromOverlay — 直接操作 OverlayRoot
 *
 * 各浮动组件自定义 show/hide 方法，在 show 中读取 anchor 后调用 _showOverlay。
 * _showOverlay/_hideOverlay 自动联动 MaskAbility（如果存在）。
 * mask 管理已拆分到独立的 MaskAbility，通过 mask option 控制。
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayRoot } from '../../overlay/OverlayRoot';
import { positionOverlay, type Placement } from '../../overlay/dispatch/positionOverlay';
import { ZIndexLevel, zIndexManager } from '../../engine';

export const OverlayAbility: AbilityDefinition = {
    get isOpen(): boolean {
        return this.abilityState('OverlayAbility:open', () => false);
    },

    mountToOverlay(el: HTMLElement): void {
        const root = OverlayRoot.getInstance().getRoot();
        if (root) root.appendChild(el);
    },

    unmountFromOverlay(el: HTMLElement): void {
        if (el.parentNode) el.parentNode.removeChild(el);
    },

    _showOverlay(opts?: { anchor?: HTMLElement; placement?: Placement }): void {
        const placement = (opts?.placement ?? this.placement ?? 'bottom') as Placement;
        const anchor = opts?.anchor ?? this.anchor;
        console.log('[_showOverlay] opts?.anchor:', opts?.anchor?.tagName, 'opts?.anchor.rect:', opts?.anchor?.getBoundingClientRect ? JSON.stringify({x: opts.anchor.getBoundingClientRect().x, y: opts.anchor.getBoundingClientRect().y, w: opts.anchor.getBoundingClientRect().width, h: opts.anchor.getBoundingClientRect().height}) : 'N/A');
        console.log('[_showOverlay] this.anchor:', this.anchor?.tagName, 'this.anchor.rect:', this.anchor?.getBoundingClientRect ? JSON.stringify({x: this.anchor.getBoundingClientRect().x, y: this.anchor.getBoundingClientRect().y, w: this.anchor.getBoundingClientRect().width, h: this.anchor.getBoundingClientRect().height}) : 'N/A');
        console.log('[_showOverlay] final anchor:', anchor?.tagName, 'anchor.rect:', anchor?.getBoundingClientRect ? JSON.stringify({x: anchor.getBoundingClientRect().x, y: anchor.getBoundingClientRect().y, w: anchor.getBoundingClientRect().width, h: anchor.getBoundingClientRect().height}) : 'N/A');
        if (!anchor && placement !== 'center') {
            this.logger?.warn?.('[_showOverlay] called without anchor');
            return;
        }
        if (anchor) {
            this.setAbilityState('OverlayAbility:anchor', anchor);
            this.setData('anchor', anchor, true);
        }
        this.setAbilityState('OverlayAbility:open', true);

        const el = this.el!;
        const persistent = this.persistent;

        if (persistent) {
            const mounted = this.abilityState('OverlayAbility:mounted', () => false);
            if (!mounted) {
                this.mountToOverlay(el);
                this.setAbilityState('OverlayAbility:mounted', true);
                this.onCleanup(() => {
                    if (this.abilityState('OverlayAbility:mounted')) {
                        this.unmountFromOverlay(el);
                    }
                });
            }
            el.style.display = '';
        } else {
            this.mountToOverlay(el);
            el.style.display = '';
            this.onCleanup(() => {
                if (this.abilityState('OverlayAbility:open')) {
                    this.unmountFromOverlay(el);
                }
            });
        }

        const zIndexLevel = this.zIndexLevel ?? ZIndexLevel.dropdown;
        el.style.zIndex = String(zIndexManager.acquire(zIndexLevel));
        el.style.pointerEvents = 'auto';

        if (placement !== 'center' && placement !== 'anchor-center') {
            el.style.position = 'absolute';
        }

        if (anchor) {
            const offset = this.offset ?? 4;
            const align = (this as any).align ?? 'center';
            console.log('[_showOverlay] before positionOverlay, el rect:', JSON.stringify({x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height}));
            console.log('[_showOverlay] placement:', placement, 'offset:', offset, 'align:', align);
            const actualPlacement = positionOverlay(el, anchor, placement, offset, true, align);
            console.log('[_showOverlay] after positionOverlay, actualPlacement:', actualPlacement, 'el rect:', JSON.stringify({x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height}));
            this.setAbilityState('OverlayAbility:actualPlacement', actualPlacement);
        }

        this.showMask?.();

        this._bindOverlayHandlers();
    },

    _hideOverlay(): void {
        this.setAbilityState('OverlayAbility:open', false);
        const el = this.el!;
        const persistent = this.persistent;

        if (persistent) {
            el.style.display = 'none';
        } else {
            this.unmountFromOverlay(el);
        }

        this.hideMask?.();
    },

    repositionOverlay(anchor?: HTMLElement, placement?: Placement, offset?: number): void {
        const actualAnchor = anchor ?? this.anchor;
        if (!actualAnchor) return;
        this.setAbilityState('OverlayAbility:anchor', actualAnchor);
        positionOverlay(
            this.el!,
            actualAnchor,
            placement ?? this.placement ?? 'bottom',
            offset ?? this.offset ?? 4,
            true
        );
        this.updateMaskPosition?.(actualAnchor);
    },

    _bindOverlayHandlers(): void {
        if (this.abilityState('OverlayAbility:handlersBound')) return;
        this.setAbilityState('OverlayAbility:handlersBound', true);

        const overlayRoot = OverlayRoot.getInstance();
        const callback = (event: Event) => {
            if (!this.abilityState('OverlayAbility:open')) return;
            const el = this.el;
            const anchor = this.abilityState('OverlayAbility:anchor');

            if (event instanceof KeyboardEvent) {
                if (event.key === 'Escape') {
                    this.hide();
                }
                return;
            }

            if (event instanceof MouseEvent) {
                if (
                    el &&
                    anchor &&
                    !el.contains(event.target as Node) &&
                    !anchor.contains(event.target as Node)
                ) {
                    this.hide();
                }
            }
        };

        overlayRoot.registerOverlay(callback);
        this.onCleanup(() => overlayRoot.unregisterOverlay(callback));
    },
} satisfies AbilityDefinition;
