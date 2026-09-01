import { Component } from '../Component';
import { ZIndexAbility, ViewportPositionAbility } from '../abilities/overlay';
import { ZIndexLevel, zIndexManager } from '../engine';
import type { Definitions } from '@/composable';
import { OverlayRoot } from './OverlayRoot';
import { positionOverlay, type Placement } from './dispatch/positionOverlay';
import { MaskComponent } from './mask';

const FloatingComponentDefs: Definitions = {
    options: {
        placement: null,
        offset: null,
        showDelay: null,
        hideDelay: null,
        viewportPosition: null,
        pointerEvents: null,
        isFloat: true,
    },
    fields: {
        _overlayOpen: false,
    },
};

export class FloatingComponent extends Component {
    static type = 'floating';

    protected _anchor: HTMLElement | null = null;
    protected _mask: MaskComponent | null = null;
    private _handlersBound = false;

    get isOpen(): boolean {
        return this._overlayOpen;
    }

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
        this._overlayOpen = true;
        const el = this.el!;
        this.mountToOverlay(el);
        this.zIndex = String(zIndexManager.acquire(ZIndexLevel.dropdown));
        this.pointerEvents = 'auto';
        const p = placement ?? 'bottom';
        if (p !== 'center' && p !== 'anchor-center') {
            this.position = 'absolute';
        }

        const actualPlacement = positionOverlay(el, anchor, p, offset ?? 4, true);
        (this as any)._actualPlacement = actualPlacement;

        this._bindGlobalHandlers();

        if (typeof (this as any).open === 'function') {
            (this as any).open();
        }
    }

    hide(): void {
        this._overlayOpen = false;
        this._removeMask();
        this.unmountFromOverlay(this.el!);
    }

    override dispose(): void {
        //this._removeMask();
        super.dispose();
    }

    protected _bindGlobalHandlers(): void {
        if (this._handlersBound) return;
        this._handlersBound = true;

        this.bind(document, 'press');
        this.bind(document, 'keydown');

        const offPress = this.on('dom:press', (ctx: any) => {
            if (!this._overlayOpen) return;
            const event = ctx?.data?.originalEvent as MouseEvent;
            const el = this.el;
            const anchor = this._anchor;
            if (
                el &&
                anchor &&
                event &&
                !el.contains(event.target as Node) &&
                !anchor.contains(event.target as Node)
            ) {
                this.hide();
            }
        });
        this.onCleanup(offPress);

        const offKeydown = this.on('dom:keydown', (ctx: any) => {
            if (!this._overlayOpen) return;
            const event = ctx?.data?.originalEvent as KeyboardEvent;
            if (event && event.key === 'Escape') {
                this.hide();
            }
        });
        this.onCleanup(offKeydown);
    }

    reposition(anchor: HTMLElement, placement?: Placement, offset?: number): void {
        this._anchor = anchor;
        positionOverlay(this.el!, anchor, placement ?? 'bottom', offset ?? 4, true);
        if (this._mask) {
            this._mask.updatePosition(anchor.getBoundingClientRect());
        }
    }

    update(data: Record<string, any>): void {
        if (typeof (this as any).onOverlayChange === 'function') {
            (this as any).onOverlayChange(data);
        }
    }

    protected _initMask(config?: { scoped?: boolean; color?: string }): void {
        if (this._mask) return;
        const zIndex = this.zIndex ? Number(this.zIndex) - 1 : 1;
        this._mask = new MaskComponent({
            scoped: config?.scoped,
            color: config?.color,
            zIndex,
        });
        this._mask.mount();
        this.onCleanup(() => this._removeMask());
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
FloatingComponent.register();
