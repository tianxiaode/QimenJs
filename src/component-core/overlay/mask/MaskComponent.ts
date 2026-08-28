import { OverlayRoot } from '../OverlayRoot';
import { maskCSS } from './mask.css';

export interface MaskOptions {
    color?: string;
    scoped?: boolean;
    zIndex?: number;
}

export class MaskComponent {
    readonly el: HTMLElement;
    private _scoped: boolean;
    private static _cssInjected = false;

    constructor(options?: MaskOptions) {
        MaskComponent._injectCSS();
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

    private static _injectCSS(): void {
        if (MaskComponent._cssInjected || typeof document === 'undefined') return;
        MaskComponent._cssInjected = true;
        const style = document.createElement('style');
        style.textContent = maskCSS;
        document.head.appendChild(style);
    }

    updatePosition(rect: DOMRect): void {
        if (!this._scoped) return;
        this.el.style.setProperty('--mask-top', `${rect.top}px`);
        this.el.style.setProperty('--mask-left', `${rect.left}px`);
        this.el.style.setProperty('--mask-width', `${rect.width}px`);
        this.el.style.setProperty('--mask-height', `${rect.height}px`);
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
