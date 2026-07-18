import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { Logger, type ILogger } from '@qimenjs/logger';

export interface OverlayDefinition {
    prefix: string;
    typeOverride?: string;
    trigger?: string;
    placement?: string;
    offset?: number;
    items?: any[];
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    overlayProps?: Record<string, any>;
}

interface OverlayInstance {
    overlay: any;
    el: HTMLElement;
    anchor: HTMLElement;
    component: any;
}

const OVERLAY_ACTIONS = ['show', 'hide', 'toggle', 'reposition', 'dispose'];

export class OverlayDispatchCenter extends RegistrarBase<Map<string, OverlayDefinition>> {
    public readonly name = 'OverlayDispatchCenter';
    protected storage = new Map<string, OverlayDefinition>();

    private readonly instances = new Map<string, OverlayInstance>();
    private readonly bus: OverlayEventBus;
    private readonly logger: ILogger;
    private zIndexCounter = 1000;

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

    nextZIndex(): number {
        return ++this.zIndexCounter;
    }

    private _listenOverlayActions(overlayKey: string): void {
        for (const action of OVERLAY_ACTIONS) {
            this.bus.overlayOn(overlayKey, action, (data: any) => {
                this._dispatchAction(overlayKey, action, data);
            });
        }
    }

    private _dispatchAction(overlayKey: string, action: string, data?: any): void {
        const { component, anchor, ...rest } = data || {};

        if (action === 'show' || action === 'toggle') {
            const existing = this.instances.get(overlayKey);
            if (existing && action === 'toggle') {
                this._closeOverlay(overlayKey);
                return;
            }
            if (existing && action === 'show') {
                if (typeof existing.overlay.reposition === 'function') {
                    existing.overlay.reposition();
                }
                return;
            }
            this._createAndShow(overlayKey, component, anchor, rest);
        } else if (action === 'hide') {
            this._closeOverlay(overlayKey);
        } else if (action === 'reposition') {
            const inst = this.instances.get(overlayKey);
            if (inst && typeof inst.overlay.reposition === 'function') {
                inst.overlay.reposition();
            }
        } else if (action === 'dispose') {
            this._disposeInstance(overlayKey);
        }
    }

    private _createAndShow(
        overlayKey: string,
        component: any,
        anchor: HTMLElement,
        extraData: any
    ): void {
        const def = this.storage.get(overlayKey);
        if (!def) {
            this.logger.warn?.(`[OverlayDispatchCenter] overlayKey="${overlayKey}" not registered`);
            return;
        }

        const capitalPrefix = def.prefix.charAt(0).toUpperCase() + def.prefix.slice(1);
        const lookupName = def.typeOverride ?? capitalPrefix;
        const OverlayClass = ComponentRegistrar.getInstance().get(lookupName);
        if (!OverlayClass) {
            this.logger.warn?.(
                `[OverlayDispatchCenter] overlay class "${lookupName}" not found in ComponentRegistrar`
            );
            return;
        }

        const overlayInstance = new OverlayClass({
            anchor: anchor ?? component?.el,
            ...def.overlayProps,
            ...extraData,
        });

        const overlayEl = overlayInstance.el;
        if (!overlayEl) return;

        overlayEl.style.zIndex = String(this.nextZIndex());

        this.instances.set(overlayKey, {
            overlay: overlayInstance,
            el: overlayEl,
            anchor: anchor ?? component?.el,
            component,
        });

        if (typeof overlayInstance.open === 'function') {
            overlayInstance.open();
        }

        this.bus.overlayEmit(overlayKey, 'shown', { overlayKey, component, anchor });
    }

    private _closeOverlay(overlayKey: string): void {
        const inst = this.instances.get(overlayKey);
        if (!inst) return;

        if (typeof inst.overlay.close === 'function') {
            inst.overlay.close();
        }

        this.bus.overlayEmit(overlayKey, 'hidden', { overlayKey, component: inst.component });
    }

    private _disposeInstance(overlayKey: string): void {
        const inst = this.instances.get(overlayKey);
        if (!inst) return;

        if (typeof inst.overlay.dispose === 'function') {
            inst.overlay.dispose();
        }
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
        console.log('zIndexCounter:', this.zIndexCounter);
    }

    dispose(): void {
        for (const [key, inst] of this.instances) {
            if (typeof inst.overlay.dispose === 'function') {
                inst.overlay.dispose();
            }
        }
        this.instances.clear();
        this.logger.debug?.('[OverlayDispatchCenter] all disposed');
    }
}

export const overlayDispatchCenter = OverlayDispatchCenter.getInstance();
