import { RegistrarBase } from '@/registry';
import { OverlayEventBus, OVERLAY_ACTIONS } from '@/events';
import { EventContextBuilder } from '@/context';
import { ComponentRegistrar } from '../../ComponentRegistrar';
import type { Placement } from './positionOverlay';
import type { ComponentClass } from '../../types';

export interface OverlayDefinition {
    type: string | { new (...args: any[]): any };
    trigger?: string;
    placement?: Placement;
    offset?: number;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    data?: Record<string, any> | (() => Record<string, any>);
    onOverlayChange?: (overlay: any, data: any) => void;
    mask?: boolean | string;
    maskMode?: 'none' | 'scoped' | 'global';
}

interface OverlayInstance {
    overlay: any;
    overlayKey: string;
    component: any;
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
    private readonly bus: OverlayEventBus;

    constructor() {
        super();
        this.bus = OverlayEventBus.getInstance();
        this.bus.onInit((component, floats) =>
            this._handleInit(component.id, { component, floats })
        );
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
                if (inst.clickOutsideHandler) {
                    document.removeEventListener('mousedown', inst.clickOutsideHandler);
                }
                if (inst.escapeHandler) {
                    document.removeEventListener('keydown', inst.escapeHandler);
                }
                inst.overlay.dispose();
                this.instances.delete(key);
            }
        }
        this.logger.debug?.(
            `[OverlayDispatchCenter] disposed all overlays for componentId="${componentId}"`
        );
    }

    private _resolveComponentType(
        type: string | { new (...args: any[]): any },
        overlayKey: string
    ): ComponentClass | undefined {
        if (typeof type === 'function') return type;
        const ctor = ComponentRegistrar.getInstance().getByType(type);
        if (!ctor) {
            this.logger.warn?.(
                `[OverlayDispatchCenter] overlayKey="${overlayKey}" type="${type}" not registered`
            );
        }
        return ctor;
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
                const def = this.storage.get(overlayKey);
                existing.overlay.show(
                    data?.anchor ?? existing.component?.el ?? existing._anchor,
                    def?.placement,
                    def?.offset
                );
                if (def) {
                    this._applyMask(existing.overlay, def);
                }
                return;
            }
            this._mountAndShow(instanceKey, overlayKey, data);
        } else if (action === OVERLAY_ACTIONS.HIDE) {
            this._closeOverlay(instanceKey, overlayKey);
        } else if (action === OVERLAY_ACTIONS.REPOSITION) {
            const existing = this.instances.get(instanceKey);
            if (existing) {
                const def = this.storage.get(overlayKey);
                existing.overlay.reposition(
                    data?.anchor ?? existing.component?.el,
                    def?.placement,
                    def?.offset
                );
            }
        } else if (action === OVERLAY_ACTIONS.CHANGE) {
            this._changeOverlay(instanceKey, overlayKey, data);
        } else if (action === OVERLAY_ACTIONS.DISPOSE) {
            this._disposeInstance(instanceKey);
        }
    }

    private _handleInit(_componentId: string, data: any): void {
        const component = data?.component;
        const floats = data?.floats;
        if (!component || !floats) return;

        const cid = component.id;
        component.onCleanup(() => this.disposeByComponent(cid));

        for (const [nodeName, floatDef] of Object.entries(floats)) {
            const def = floatDef as Record<string, any>;
            const anchor = component.getNodeEl?.(nodeName) ?? component.el;
            const overlayKey = `${cid}:${nodeName}`;

            const ctor = this._resolveComponentType(def.type, overlayKey);
            if (!ctor) continue;

            this.register(overlayKey, {
                type: ctor,
                trigger: def.trigger,
                placement: def.placement,
                offset: def.offset,
                closeOnClickOutside: def.closeOnClickOutside,
                closeOnEscape: def.closeOnEscape,
                mask: def.mask,
                maskMode: def.maskMode,
                data: def.data,
            });

            if (def.emits) {
                this._bindFloatEmits(overlayKey, def.emits, component);
            }

            const trigger = def.trigger ?? 'click';
            const triggers = Array.isArray(trigger) ? trigger : [trigger];

            for (const t of triggers) {
                if (t === 'manual') continue;

                if (t === 'always') {
                    this.bus.overlayEmit(
                        EventContextBuilder.create()
                            .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.SHOW}`)
                            .withType(OVERLAY_ACTIONS.SHOW)
                            .withSource(overlayKey)
                            .withData({ component, anchor })
                            .build()
                    );
                    continue;
                }

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
                    component.bind(anchor, 'enter');
                    component.on('dom:enter', () => {
                        this.bus.overlayEmit(
                            EventContextBuilder.create()
                                .withEvent(`overlay:${overlayKey}:${showAction}`)
                                .withType(showAction)
                                .withSource(overlayKey)
                                .withData({ component, anchor })
                                .build()
                        );
                    });
                    component.bind(anchor, 'leave');
                    component.on('dom:leave', () => {
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

    /**
     * 订阅浮层反馈事件并转发到组件
     *
     * 根据 FloatDecl.emits 配置，自动订阅 OverlayEventBus 的
     * shown/hidden/changed 反馈事件，转发为组件自身的 emit 事件。
     *
     * @param overlayKey - 浮层注册 key（如 "cmpId:dropIcon"）
     * @param emits - 事件转发映射 { 反馈事件名 → 组件事件名 }
     * @param component - 触发组件实例
     */
    private _bindFloatEmits(
        overlayKey: string,
        emits: Record<string, string>,
        component: any
    ): void {
        for (const [feedbackEvent, componentEvent] of Object.entries(emits)) {
            this.bus.overlayOn(overlayKey, feedbackEvent, (data: any) => {
                component.emit?.(componentEvent, data);
            });
        }
    }

    private _applyMask(overlay: any, def: OverlayDefinition): void {
        if (def.maskMode === 'scoped') {
            overlay._initMask({
                scoped: true,
                color: typeof def.mask === 'string' ? def.mask : undefined,
            });
        } else if (def.maskMode !== 'none' && def.mask) {
            overlay._initMask({
                color: typeof def.mask === 'string' ? def.mask : undefined,
            });
        }
    }

    /**
     * 挂载并显示浮层
     *
     * 优先使用 data.overlay（调用方提供的实例）；
     * 若未提供，则从 def.type 直接创建实例。
     * trigger: 'always' 的浮层在 _handleInit 中自动触发 SHOW，无需手动调用。
     */
    private _mountAndShow(instanceKey: string, overlayKey: string, data: any): void {
        const def = this.storage.get(overlayKey);
        if (!def) {
            this.logger.warn?.(`[OverlayDispatchCenter] overlayKey="${overlayKey}" not registered`);
            return;
        }

        const { component, anchor, overlay } = data || {};
        let overlayInst = overlay;
        if (!overlayInst) {
            const OverlayClass = this._resolveComponentType(def.type, overlayKey);
            if (!OverlayClass) return;
            const overlayData = typeof def.data === 'function' ? def.data() : def.data;
            overlayInst = new OverlayClass({ ...overlayData });
        }

        const anchorEl = anchor ?? component?.el;
        const trigger = def.trigger ?? 'manual';

        overlayInst.show(anchorEl, def.placement, def.offset);
        this._applyMask(overlayInst, def);

        const inst: OverlayInstance = {
            overlay: overlayInst,
            overlayKey,
            component,
        };

        if (trigger !== 'always' && !def.mask && def.closeOnClickOutside !== false) {
            inst.clickOutsideHandler = (e: MouseEvent) => {
                const overlayEl = overlayInst.el;
                const aEl = anchorEl;
                if (!overlayEl.contains(e.target as Node) && !aEl.contains(e.target as Node)) {
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

        this.bus.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:shown`)
                .withType('shown')
                .withSource(overlayKey)
                .withData({
                    overlayKey,
                    component,
                    anchor,
                    placement: def.placement ?? 'bottom',
                })
                .build()
        );
    }

    private _changeOverlay(instanceKey: string, overlayKey: string, data: any): void {
        const inst = this.instances.get(instanceKey);
        if (!inst) return;

        const changeData = data?.data ?? data;
        inst.overlay.update(changeData);

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

        inst.overlay.hide();

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

        if (inst.clickOutsideHandler) {
            document.removeEventListener('mousedown', inst.clickOutsideHandler);
        }
        if (inst.escapeHandler) {
            document.removeEventListener('keydown', inst.escapeHandler);
        }

        inst.overlay.dispose();
        this.instances.delete(instanceKey);
    }

    protected doInspect(): void {
        const definitions = [...this.storage.keys()];
        const instances = [...this.instances.entries()].map(([key, inst]) => ({
            instanceKey: key,
            overlayType: inst.overlay.constructor.name,
        }));

        console.log('Definitions:', definitions);
        console.log('Instances:', instances);
    }

    dispose(): void {
        for (const [_key, inst] of this.instances) {
            inst.overlay.dispose();
            if (inst.clickOutsideHandler) {
                document.removeEventListener('mousedown', inst.clickOutsideHandler);
            }
            if (inst.escapeHandler) {
                document.removeEventListener('keydown', inst.escapeHandler);
            }
        }
        this.instances.clear();

        this.logger.debug?.('[OverlayDispatchCenter] all disposed');
    }
}

export const overlayDispatchCenter = OverlayDispatchCenter.getInstance();
