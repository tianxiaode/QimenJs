import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { OverlayRoot } from '@/component/OverlayRoot';
import { ZIndexLevel, nextZIndex } from '@/component/z-index';
import { positionOverlay, type Placement } from '@/component-core/abilities/positionOverlay';
import { Logger, type ILogger } from '@qimenjs/logger';

export interface OverlayDefinition {
    type: string;
    trigger?: string;
    placement?: Placement;
    offset?: number;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    data?: Record<string, any> | (() => Record<string, any>);
}

interface OverlayInstance {
    overlay: any;
    el: HTMLElement;
    anchor: HTMLElement;
    component: any;
    clickOutsideHandler?: (e: MouseEvent) => void;
    escapeHandler?: (e: KeyboardEvent) => void;
}

const OVERLAY_ACTIONS = ['show', 'hide', 'toggle', 'reposition', 'dispose'];

export class OverlayDispatchCenter extends RegistrarBase<Map<string, OverlayDefinition>> {
    public readonly name = 'OverlayDispatchCenter';
    protected storage = new Map<string, OverlayDefinition>();

    private readonly instances = new Map<string, OverlayInstance>();
    private readonly bus: OverlayEventBus;
    private readonly logger: ILogger;

    constructor() {
        super();
        this.bus = OverlayEventBus.getInstance();
        this.logger = Logger.for('overlay-dispatch');
        this.logger.debug?.('[OverlayDispatchCenter] initialized');
    }

    register(overlayKey: string, definition: OverlayDefinition): void {
        this.checkLock();
        this.storage.set(overlayKey, definition);
        this._listenOverlayActions(overlayKey);
        this.logger.debug?.(`[OverlayDispatchCenter] registered overlayKey="${overlayKey}"`);
    }

    registerAll(definitions: Record<string, OverlayDefinition>): void {
        for (const [overlayKey, def] of Object.entries(definitions)) {
            this.register(overlayKey, def);
        }
    }

    unregister(overlayKey: string): void {
        this.checkLock();
        this._disposeInstance(overlayKey);
        this.storage.delete(overlayKey);
        this.logger.debug?.(`[OverlayDispatchCenter] unregistered overlayKey="${overlayKey}"`);
    }

    get(overlayKey: string): OverlayDefinition | undefined {
        return this.storage.get(overlayKey);
    }

    getOverlay(overlayKey: string): any | undefined {
        return this.instances.get(overlayKey)?.overlay;
    }

    private _listenOverlayActions(overlayKey: string): void {
        for (const action of OVERLAY_ACTIONS) {
            this.bus.overlayOn(overlayKey, action, (data: any) => {
                this._dispatchAction(overlayKey, action, data);
            });
        }
    }

    private _dispatchAction(overlayKey: string, action: string, data?: any): void {
        if (action === 'show' || action === 'toggle') {
            const existing = this.instances.get(overlayKey);
            if (existing && action === 'toggle') {
                this._closeOverlay(overlayKey);
                return;
            }
            if (existing && action === 'show') {
                this._reposition(overlayKey);
                return;
            }
            this._mountAndShow(overlayKey, data);
        } else if (action === 'hide') {
            this._closeOverlay(overlayKey);
        } else if (action === 'reposition') {
            this._reposition(overlayKey);
        } else if (action === 'dispose') {
            this._disposeInstance(overlayKey);
        }
    }

    private _mountAndShow(overlayKey: string, data: any): void {
        const def = this.storage.get(overlayKey);
        if (!def) {
            this.logger.warn?.(`[OverlayDispatchCenter] overlayKey="${overlayKey}" not registered`);
            return;
        }

        const { component, anchor, overlay } = data || {};
        if (!overlay) {
            this.logger.warn?.(
                `[OverlayDispatchCenter] overlayKey="${overlayKey}" missing overlay instance in data`
            );
            return;
        }

        const overlayEl = overlay.el;
        if (!overlayEl) return;

        const anchorEl = anchor ?? component?.el;
        const placement = def.placement ?? 'bottom';
        const offset = def.offset ?? 4;

        overlayEl.style.position = 'absolute';
        overlayEl.style.zIndex = String(nextZIndex(ZIndexLevel.dropdown));
        overlayEl.style.display = 'none';
        overlayEl.style.pointerEvents = 'auto';

        OverlayRoot.getInstance().mountOverlay(overlayEl);

        const actualPlacement = positionOverlay(overlayEl, anchorEl, placement, offset, true);
        overlayEl.style.display = '';

        const inst: OverlayInstance = {
            overlay,
            el: overlayEl,
            anchor: anchorEl,
            component,
        };

        if (def.closeOnClickOutside !== false) {
            inst.clickOutsideHandler = (e: MouseEvent) => {
                if (!overlayEl.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
                    this._closeOverlay(overlayKey);
                }
            };
            document.addEventListener('mousedown', inst.clickOutsideHandler);
        }

        if (def.closeOnEscape !== false) {
            inst.escapeHandler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    this._closeOverlay(overlayKey);
                }
            };
            document.addEventListener('keydown', inst.escapeHandler);
        }

        this.instances.set(overlayKey, inst);

        if (typeof overlay.open === 'function') {
            overlay.open();
        }

        this.bus.overlayEmit(overlayKey, 'shown', {
            overlayKey,
            component,
            anchor,
            placement: actualPlacement,
        });
    }

    private _reposition(overlayKey: string): void {
        const inst = this.instances.get(overlayKey);
        if (!inst) return;

        const def = this.storage.get(overlayKey);
        const placement = def?.placement ?? 'bottom';
        const offset = def?.offset ?? 4;
        positionOverlay(inst.el, inst.anchor, placement, offset, true);
    }

    private _closeOverlay(overlayKey: string): void {
        const inst = this.instances.get(overlayKey);
        if (!inst) return;

        if (inst.clickOutsideHandler) {
            document.removeEventListener('mousedown', inst.clickOutsideHandler);
        }
        if (inst.escapeHandler) {
            document.removeEventListener('keydown', inst.escapeHandler);
        }

        if (typeof inst.overlay.close === 'function') {
            inst.overlay.close();
        }

        OverlayRoot.getInstance().unmountOverlay(inst.el);

        this.bus.overlayEmit(overlayKey, 'hidden', { overlayKey, component: inst.component });
    }

    private _disposeInstance(overlayKey: string): void {
        const inst = this.instances.get(overlayKey);
        if (!inst) return;

        if (inst.clickOutsideHandler) {
            document.removeEventListener('mousedown', inst.clickOutsideHandler);
        }
        if (inst.escapeHandler) {
            document.removeEventListener('keydown', inst.escapeHandler);
        }

        if (typeof inst.overlay.dispose === 'function') {
            inst.overlay.dispose();
        }

        OverlayRoot.getInstance().unmountOverlay(inst.el);
        this.instances.delete(overlayKey);
    }

    protected doInspect(): void {
        const definitions = [...this.storage.keys()];
        const instances = [...this.instances.entries()].map(([key, inst]) => ({
            overlayKey: key,
            overlayType: inst.overlay.constructor.name,
            zIndex: inst.el.style.zIndex,
        }));

        console.log('Definitions:', definitions);
        console.log('Instances:', instances);
    }

    dispose(): void {
        for (const [key, inst] of this.instances) {
            if (inst.clickOutsideHandler) {
                document.removeEventListener('mousedown', inst.clickOutsideHandler);
            }
            if (inst.escapeHandler) {
                document.removeEventListener('keydown', inst.escapeHandler);
            }
            if (typeof inst.overlay.dispose === 'function') {
                inst.overlay.dispose();
            }
            OverlayRoot.getInstance().unmountOverlay(inst.el);
        }
        this.instances.clear();
        this.logger.debug?.('[OverlayDispatchCenter] all disposed');
    }
}

export const overlayDispatchCenter = OverlayDispatchCenter.getInstance();
