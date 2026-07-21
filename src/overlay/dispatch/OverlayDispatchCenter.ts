import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { OVERLAY_ACTIONS, OVERLAY_FEEDBACK_EVENTS } from '@/events/overlay-events';
import { EventContextBuilder } from '@/context';
import { OverlayRoot } from '../OverlayRoot';
import { ZIndexLevel, nextZIndex } from '@/component/z-index';
import { positionOverlay, type Placement } from './positionOverlay';

export interface OverlayDefinition {
    type: string;
    trigger?: string;
    placement?: Placement;
    offset?: number;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    data?: Record<string, any> | (() => Record<string, any>);
    onOverlayChange?: (overlay: any, data: any) => void;
    mask?: boolean | string;
}

interface OverlayInstance {
    overlay: any;
    el: HTMLElement;
    anchor: HTMLElement;
    component: any;
    maskEl?: HTMLElement;
    clickOutsideHandler?: (e: MouseEvent) => void;
    escapeHandler?: (e: KeyboardEvent) => void;
}

const OVERLAY_ACTION_LIST = Object.values(OVERLAY_ACTIONS);

function encodeInstanceKey(componentId: string, overlayKey: string): string {
    return `${componentId}:${overlayKey}`;
}

export class OverlayDispatchCenter extends RegistrarBase<Map<string, OverlayDefinition>> {
    public readonly name = 'OverlayDispatchCenter';
    protected storage = new Map<string, OverlayDefinition>();

    private readonly instances = new Map<string, OverlayInstance>();
    private _activeMaskEl: HTMLElement | null = null;
    private _activeMaskCount: number = 0;
    private readonly bus: OverlayEventBus;

    constructor() {
        super();
        this.bus = OverlayEventBus.getInstance();
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

    getOverlay(componentId: string, overlayKey: string): any | undefined {
        const key = encodeInstanceKey(componentId, overlayKey);
        return this.instances.get(key)?.overlay;
    }

    disposeByComponent(componentId: string): void {
        const prefix = `${componentId}:`;
        for (const [key, inst] of this.instances) {
            if (key.startsWith(prefix)) {
                this._cleanupInstance(inst);
                if (inst.maskEl) {
                    this._releaseMask(inst.maskEl);
                }
                OverlayRoot.getInstance().unmountOverlay(inst.el);
                this.instances.delete(key);
            }
        }
        this.logger.debug?.(
            `[OverlayDispatchCenter] disposed all overlays for componentId="${componentId}"`
        );
    }

    private _listenOverlayActions(overlayKey: string): void {
        for (const action of OVERLAY_ACTION_LIST) {
            this.bus.overlayOn(overlayKey, action, (data: any) => {
                this._dispatchAction(overlayKey, action, data);
            });
        }
    }

    private _dispatchAction(overlayKey: string, action: string, data?: any): void {
        if (action === OVERLAY_ACTIONS.INIT) {
            this._handleInit(overlayKey, data);
            return;
        }

        const componentId = data?.component?.id;
        if (!componentId) {
            this.logger.warn?.(`[OverlayDispatchCenter] action="${action}" missing component.id`);
            return;
        }

        const instanceKey = encodeInstanceKey(componentId, overlayKey);

        if (action === OVERLAY_ACTIONS.SHOW || action === OVERLAY_ACTIONS.TOGGLE) {
            const existing = this.instances.get(instanceKey);
            if (existing && action === OVERLAY_ACTIONS.TOGGLE) {
                this._closeOverlay(instanceKey, overlayKey);
                return;
            }
            if (existing && action === OVERLAY_ACTIONS.SHOW) {
                this._reposition(instanceKey);
                return;
            }
            this._mountAndShow(instanceKey, overlayKey, data);
        } else if (action === OVERLAY_ACTIONS.HIDE) {
            this._closeOverlay(instanceKey, overlayKey);
        } else if (action === OVERLAY_ACTIONS.REPOSITION) {
            this._reposition(instanceKey);
        } else if (action === OVERLAY_ACTIONS.CHANGE) {
            this._changeOverlay(instanceKey, overlayKey, data);
        } else if (action === OVERLAY_ACTIONS.DISPOSE) {
            this._disposeInstance(instanceKey);
        }
    }

    private _handleInit(componentId: string, data: any): void {
        const component = data?.component;
        const floats = data?.floats;
        if (!component || !floats) return;

        component.onCleanup(() => this.disposeByComponent(componentId));

        for (const [nodeName, floatDef] of Object.entries(floats)) {
            const def = floatDef as Record<string, any>;
            const anchor = component.nodeMap?.[nodeName]?.el ?? component.el;
            const overlayKey = `${componentId}:${nodeName}`;

            this.register(overlayKey, {
                type: def.type,
                trigger: def.trigger,
                placement: def.placement,
                offset: def.offset,
                closeOnClickOutside: def.closeOnClickOutside,
                closeOnEscape: def.closeOnEscape,
                mask: def.mask,
            });

            const trigger = def.trigger ?? 'click';
            const triggers = Array.isArray(trigger) ? trigger : [trigger];

            for (const t of triggers) {
                if (t === 'manual' || t === 'always') continue;

                const showAction = t === 'hover' ? OVERLAY_ACTIONS.SHOW : OVERLAY_ACTIONS.TOGGLE;

                if (t === 'click') {
                    component.bind(anchor, 'click');
                    component.on('dom:click', (e: any) => {
                        e?.stopPropagation?.();
                        this.bus.overlayEmit(
                            EventContextBuilder.create()
                                .withEvent(`overlay:${overlayKey}:${showAction}`)
                                .withType(showAction)
                                .withSource(overlayKey)
                                .withData({ component, anchor })
                                .build()
                        );
                    });
                } else if (t === 'hover') {
                    component.bind(anchor, 'mouseenter');
                    component.on('dom:mouseenter', () => {
                        this.bus.overlayEmit(
                            EventContextBuilder.create()
                                .withEvent(`overlay:${overlayKey}:${showAction}`)
                                .withType(showAction)
                                .withSource(overlayKey)
                                .withData({ component, anchor })
                                .build()
                        );
                    });
                    component.bind(anchor, 'mouseleave');
                    component.on('dom:mouseleave', () => {
                        this.bus.overlayEmit(
                            EventContextBuilder.create()
                                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.HIDE}`)
                                .withType(OVERLAY_ACTIONS.HIDE)
                                .withSource(overlayKey)
                                .withData({ component, anchor })
                                .build()
                        );
                    });
                } else if (t === 'focus') {
                    component.bind(anchor, 'focus');
                    component.on('dom:focus', () => {
                        this.bus.overlayEmit(
                            EventContextBuilder.create()
                                .withEvent(`overlay:${overlayKey}:${showAction}`)
                                .withType(showAction)
                                .withSource(overlayKey)
                                .withData({ component, anchor })
                                .build()
                        );
                    });
                    component.bind(anchor, 'blur');
                    component.on('dom:blur', () => {
                        this.bus.overlayEmit(
                            EventContextBuilder.create()
                                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.HIDE}`)
                                .withType(OVERLAY_ACTIONS.HIDE)
                                .withSource(overlayKey)
                                .withData({ component, anchor })
                                .build()
                        );
                    });
                }
            }
        }
    }

    private _mountAndShow(instanceKey: string, overlayKey: string, data: any): void {
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
        const trigger = def.trigger ?? 'manual';

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

        if (def.mask) {
            inst.maskEl = this._acquireMask(def.mask === true ? undefined : def.mask);
        }

        if (trigger !== 'always' && !def.mask && def.closeOnClickOutside !== false) {
            inst.clickOutsideHandler = (e: MouseEvent) => {
                if (!overlayEl.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
                    this._closeOverlay(instanceKey, overlayKey);
                }
            };
            document.addEventListener('mousedown', inst.clickOutsideHandler);
        }

        if (trigger !== 'always' && def.closeOnEscape !== false) {
            inst.escapeHandler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    this._closeOverlay(instanceKey, overlayKey);
                }
            };
            document.addEventListener('keydown', inst.escapeHandler);
        }

        this.instances.set(instanceKey, inst);

        overlay.hidden = false;

        this.bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:shown`)
                .withType('shown')
                .withSource(overlayKey)
                .withData({
                    overlayKey,
                    component,
                    anchor,
                    placement: actualPlacement,
                })
                .build()
        );
    }

    private _reposition(instanceKey: string): void {
        const inst = this.instances.get(instanceKey);
        if (!inst) return;

        const def = this.storage.get(instanceKey.split(':').pop()!);
        const placement = def?.placement ?? 'bottom';
        const offset = def?.offset ?? 4;
        positionOverlay(inst.el, inst.anchor, placement, offset, true);
    }

    private _changeOverlay(instanceKey: string, overlayKey: string, data: any): void {
        const inst = this.instances.get(instanceKey);
        if (!inst) return;

        const def = this.storage.get(overlayKey);
        const changeData = data?.data ?? data;

        if (def?.onOverlayChange) {
            def.onOverlayChange(inst.overlay, changeData);
        } else if (typeof inst.overlay.onOverlayChange === 'function') {
            inst.overlay.onOverlayChange(changeData);
        }

        this.bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:changed`)
                .withType('changed')
                .withSource(overlayKey)
                .withData({
                    overlayKey,
                    component: inst.component,
                    data: changeData,
                })
                .build()
        );
    }

    private _closeOverlay(instanceKey: string, overlayKey: string): void {
        const inst = this.instances.get(instanceKey);
        if (!inst) return;

        if (inst.clickOutsideHandler) {
            document.removeEventListener('mousedown', inst.clickOutsideHandler);
        }
        if (inst.escapeHandler) {
            document.removeEventListener('keydown', inst.escapeHandler);
        }

        inst.overlay.hidden = true;

        if (inst.maskEl) {
            this._releaseMask(inst.maskEl);
            inst.maskEl = undefined;
        }

        OverlayRoot.getInstance().unmountOverlay(inst.el);

        this.bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:hidden`)
                .withType('hidden')
                .withSource(overlayKey)
                .withData({ overlayKey, component: inst.component })
                .build()
        );
    }

    private _disposeInstance(instanceKey: string): void {
        const inst = this.instances.get(instanceKey);
        if (!inst) return;

        this._cleanupInstance(inst);

        if (inst.maskEl) {
            this._releaseMask(inst.maskEl);
        }

        OverlayRoot.getInstance().unmountOverlay(inst.el);
        this.instances.delete(instanceKey);
    }

    private _cleanupInstance(inst: OverlayInstance): void {
        if (inst.clickOutsideHandler) {
            document.removeEventListener('mousedown', inst.clickOutsideHandler);
        }
        if (inst.escapeHandler) {
            document.removeEventListener('keydown', inst.escapeHandler);
        }
        if (typeof inst.overlay.dispose === 'function') {
            inst.overlay.dispose();
        }
    }

    private _acquireMask(color?: string): HTMLElement {
        this._activeMaskCount++;

        if (!this._activeMaskEl) {
            const mask = document.createElement('div');
            mask.className = 'q-overlay-mask';
            mask.style.position = 'fixed';
            mask.style.top = '0';
            mask.style.left = '0';
            mask.style.width = '100%';
            mask.style.height = '100%';
            mask.style.backgroundColor = color ?? 'rgba(0, 0, 0, 0.5)';
            mask.style.zIndex = String(nextZIndex(ZIndexLevel.mask));
            mask.style.display = '';

            OverlayRoot.getInstance().mountOverlay(mask);
            this._activeMaskEl = mask;
        }

        return this._activeMaskEl;
    }

    private _releaseMask(maskEl: HTMLElement): void {
        this._activeMaskCount--;
        if (this._activeMaskCount <= 0) {
            this._activeMaskCount = 0;
            if (this._activeMaskEl) {
                OverlayRoot.getInstance().unmountOverlay(this._activeMaskEl);
                this._activeMaskEl = null;
            }
        }
    }

    protected doInspect(): void {
        const definitions = [...this.storage.keys()];
        const instances = [...this.instances.entries()].map(([key, inst]) => ({
            instanceKey: key,
            overlayType: inst.overlay.constructor.name,
            zIndex: inst.el.style.zIndex,
            hasMask: !!inst.maskEl,
        }));

        console.log('Definitions:', definitions);
        console.log('Instances:', instances);
        console.log(
            'Active mask:',
            this._activeMaskEl ? 'yes' : 'no',
            `count=${this._activeMaskCount}`
        );
    }

    dispose(): void {
        for (const [key, inst] of this.instances) {
            this._cleanupInstance(inst);
            OverlayRoot.getInstance().unmountOverlay(inst.el);
        }
        this.instances.clear();

        if (this._activeMaskEl) {
            OverlayRoot.getInstance().unmountOverlay(this._activeMaskEl);
            this._activeMaskEl = null;
        }
        this._activeMaskCount = 0;

        this.logger.debug?.('[OverlayDispatchCenter] all disposed');
    }
}

export const overlayDispatchCenter = OverlayDispatchCenter.getInstance();
