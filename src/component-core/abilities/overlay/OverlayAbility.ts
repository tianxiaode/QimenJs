/**
 * OverlayAbility — 浮层能力
 *
 * 为浮动组件提供浮层（overlay）操作能力：
 * - show / hide — 挂载到 OverlayRoot + z-index + 定位 + 点击外部关闭
 * - repositionOverlay — 重新定位
 * - mountToOverlay / unmountFromOverlay — 直接操作 OverlayRoot
 *
 * show/hide 自动联动 MaskAbility 的 showMask/hideMask（如果存在）。
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

    show(): void {
        const anchor = this.anchor;
        if (!anchor) {
            this.logger?.warn?.('[OverlayAbility] show() called without anchor option');
            return;
        }
        this.setAbilityState('OverlayAbility:anchor', anchor);
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

        const placement = (this.placement ?? 'bottom') as Placement;
        if (placement !== 'center' && placement !== 'anchor-center') {
            el.style.position = 'absolute';
        }

        const offset = this.offset ?? 4;
        const align = (this as any).align ?? 'center';
        const actualPlacement = positionOverlay(el, anchor, placement, offset, true, align);
        this.setAbilityState('OverlayAbility:actualPlacement', actualPlacement);

        this.showMask?.();

        this._bindOverlayHandlers();
    },

    hide(): void {
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
            placement ?? (this.placement ?? 'bottom'),
            offset ?? (this.offset ?? 4),
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
