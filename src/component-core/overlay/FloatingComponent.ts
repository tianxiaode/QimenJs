import { Component } from '../Component';
import { ZIndexAbility, ViewportPositionAbility } from '../abilities/overlay';
import { ZIndexLevel, zIndexManager } from '../engine';
import type { Definitions } from '@/composable';
import { OverlayRoot } from './OverlayRoot';
import { positionOverlay, type Placement } from './dispatch/positionOverlay';
import { MaskComponent } from './mask/MaskComponent';

const FloatingComponentDefs: Definitions = {
    options: {
        placement: null,
        offset: null,
        showDelay: null,
        hideDelay: null,
        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,
        position: null,
        zIndex: null,
        viewportPosition: null,
        transform: null,
    },
    property: {
        _overlayOpen: false,
    },
};

export class FloatingComponent extends Component {
    static type = 'floating';

    protected _anchor: HTMLElement | null = null;
    protected _mask: MaskComponent | null = null;

    get overlayRoot(): HTMLElement | null {
        if (typeof document === 'undefined') return null;
        return OverlayRoot.getInstance().getRoot();
    }

    mountToOverlay(el: HTMLElement): void {
        const root = this.overlayRoot;
        if (root) {
            root.appendChild(el);
        }
    }

    unmountFromOverlay(el: HTMLElement): void {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    show(anchor: HTMLElement, placement?: Placement, offset?: number): void {
        this._anchor = anchor;
        this.mountToOverlay(this.el);
        this.el.style.zIndex = String(zIndexManager.acquire(ZIndexLevel.dropdown));
        this.el.style.display = 'none';
        this.el.style.pointerEvents = 'auto';

        const p = placement ?? 'bottom';
        if (p !== 'center' && p !== 'anchor-center') {
            this.el.style.position = 'absolute';
        }

        positionOverlay(this.el, anchor, p, offset ?? 4, true);
        this.el.style.display = '';
    }

    hide(): void {
        this._removeMask();
        this.unmountFromOverlay(this.el);
    }

    reposition(anchor: HTMLElement, placement?: Placement, offset?: number): void {
        this._anchor = anchor;
        positionOverlay(this.el, anchor, placement ?? 'bottom', offset ?? 4, true);
        if (this._mask) {
            this._mask.updatePosition(anchor.getBoundingClientRect());
        }
    }

    update(data: Record<string, any>): void {
        if (typeof (this as any).onOverlayChange === 'function') {
            (this as any).onOverlayChange(data);
        }
    }

    override dispose(): void {
        this._removeMask();
        super.dispose();
    }

    protected _initMask(config?: { scoped?: boolean; color?: string }): void {
        if (this._mask) return;
        this._mask = new MaskComponent({
            scoped: config?.scoped,
            color: config?.color,
            zIndex: zIndexManager.acquire(ZIndexLevel.mask),
        });
        this._mask.mount();
        if (this._anchor) {
            this._mask.updatePosition(this._anchor.getBoundingClientRect());
        }
    }

    protected _removeMask(): void {
        if (this._mask) {
            this._mask.dispose();
            this._mask = null;
        }
    }
}

FloatingComponent.define(FloatingComponentDefs);
FloatingComponent.use([ZIndexAbility, ViewportPositionAbility]);
