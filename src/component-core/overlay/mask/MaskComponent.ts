import { OverlayRoot } from '../OverlayRoot';
import './mask.css';

export interface MaskOptions {
    color?: string;
    scoped?: boolean;
    zIndex?: number;
}

export class MaskComponent {
    readonly el: HTMLElement;
    private _scoped: boolean;

    constructor(options?: MaskOptions) {
        this._scoped = options?.scoped ?? false;
        this.el = document.createElement('div');
        this.el.className = `q-overlay-mask${this._scoped ? ' q-overlay-mask--scoped' : ''}`;
        if (options?.color) {
            this.el.style.setProperty('--mask-color', options.color);
        }
        if (options?.zIndex !== undefined) {
            this.el.style.zIndex = String(options.zIndex);
        }
    }

    updatePosition(rect: DOMRect): void {
        if (!this._scoped) return;
        this.el.style.setProperty('--mask-top', `${rect.top}px`);
        this.el.style.setProperty('--mask-left', `${rect.left}px`);
        this.el.style.setProperty('--mask-width', `${rect.width}px`);
        this.el.style.setProperty('--mask-height', `${rect.height}px`);
    }

    show(): void {
        this.el.style.display = '';
    }

    hide(): void {
        this.el.style.display = 'none';
    }

    mount(): void {
        OverlayRoot.getInstance().mountOverlay(this.el);
    }

    unmount(): void {
        OverlayRoot.getInstance().unmountOverlay(this.el);
    }

    dispose(): void {
        this.unmount();
    }
}
