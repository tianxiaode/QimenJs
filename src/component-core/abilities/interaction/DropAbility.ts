import type { AbilityDefinition } from '@/composable';
import { dragStateManager } from '../../engine';
import type { DropOptions } from '../../types';

export const DropAbility: AbilityDefinition = {
    _commitDrops(): void {
        const dropMode = this.drop;

        if (dropMode === false || dropMode === null || dropMode === undefined) {
            const zone = this.dropZone ||'self';
            this._disposeDropZone(zone);
            return;
        }

        const config = typeof dropMode === 'object' && dropMode !== null ? dropMode : {};
        const zone = config.zone || this.dropZone || 'self';
        console.log('[DropAbility] _commitDrops, drop =', dropMode, 'zone =', zone);

        const el = zone === 'self' ? this.el : this.getNodeEl(zone);
       6,
        if (!el) {
            console.log('[DropAbility] no el for zone =', zone, 'abort');
            return;
        }

        this._initDropZone(zone, el, config);
    },

    _initDropZone(zone: string, el: HTMLElement, config: DropOptions): void {
        console.log('[DropAbility] _initDropZone, zone =', zone, 'config =', config, 'el =', el?.tagName);
        this._disposeDropZone(zone);

        this._dropConfig = config;
        this._dropZone = zone;
        this._dropEl = el;
        this._dropEntered = false;

        try {
            console.log('[DropAbility] before bind enter');
            this.bind(el, 'enter');
            console.log('[DropAbility] bind enter done');
            this.bind(el, 'leave');
            console.log('[DropAbility] bind leave done');
        } catch (e) {
            console.error('[DropAbility] bind error:', e);
        }

        this._dropEnterHandler = () => {
            console.log('[DropAbility] dom:enter fired, isDragging =', dragStateManager.isDragging());
            if (!dragStateManager.isDragging()) return;

            const activeDrag = dragStateManager.getActiveDrag();
            if (!activeDrag) return;

            const accept = config.accept;
            if (accept && accept.length > 0) {
                if (!activeDrag.dragType || !accept.includes(activeDrag.dragType)) {
                    console.log('[DropAbility] accept mismatch, dragType =', activeDrag.dragType, 'accept =', accept);
                    return;
                }
            }

            console.log('[DropAbility] enter accepted, zone =', zone);
            this._dropEntered = true;

            if (config.activeClass) el.classList.add(config.activeClass);

            const handlerName = zone.charAt(0).toUpperCase() + zone.slice(1);
            const enterHandler = this[`on${handlerName}DragEnter`];
            if (typeof enterHandler === 'function') {
                enterHandler.call(this, {
                    dragKey: activeDrag.dragKey,
                    dragType: activeDrag.dragType,
                    dragData: activeDrag.dragData,
                    el,
                });
            }

            this._dropEndOff = this.on('drag:end', (data: any) => {
                if (!this._dropEntered) return;

                this._dropEntered = false;

                if (config.activeClass) el.classList.remove(config.activeClass);

                const onDropMethod = config.onDrop
                    ? this[config.onDrop]
                    : this[`on${handlerName}DragDrop`];
                if (typeof onDropMethod === 'function') {
                    onDropMethod.call(this, {
                        dragKey: data?.dragKey ?? activeDrag.dragKey,
                        dragType: data?.dragType ?? activeDrag.dragType,
                        dragData: data?.dragData ?? activeDrag.dragData,
                        el,
                        originalEvent: data?.originalEvent,
                    });
                }

                this._dropEndOff?.();
                this._dropEndOff = undefined;
            });
        };

        this._dropLeaveHandler = () => {
            console.log('[DropAbility] dom:leave fired, _dropEntered =', this._dropEntered);
            if (!this._dropEntered) return;

            this._dropEntered = false;

            if (config.activeClass) el.classList.remove(config.activeClass);

            const handlerName = zone.charAt(0).toUpperCase() + zone.slice(1);
            const leaveHandler = this[`on${handlerName}DragLeave`];
            if (typeof leaveHandler === 'function') {
                const activeDrag = dragStateManager.getActiveDrag();
                leaveHandler.call(this, {
                    dragKey: activeDrag?.dragKey,
                    el,
                });
            }

            this._dropEndOff?.();
            this._dropEndOff = undefined;
        };

        this.on('dom:enter', this._dropEnterHandler);
        this.on('dom:leave', this._dropLeaveHandler);
        console.log('[DropAbility] on("dom:enter"/"dom:leave") registered');

        this.onCleanup(() => this._disposeDropZone(zone));
    },

    _disposeDropZone(zone: string): void {
        if (this._dropEnterHandler) {
            this.off('dom:enter', this._dropEnterHandler);
            this._dropEnterHandler = undefined;
        }
        if (this._dropLeaveHandler) {
            this.off('dom:leave', this._dropLeaveHandler);
            this._dropLeaveHandler = undefined;
        }

        this._dropEndOff?.();
        this._dropEndOff = undefined;

        if (this._dropConfig?.activeClass && this._dropEl) {
            this._dropEl.classList.remove(this._dropConfig.activeClass);
        }

        this._dropEntered = false;
        this._dropConfig = undefined;
        this._dropZone = undefined;
        this._dropEl = undefined;
    },

    attachDropZone(zone: string, options: DropOptions = {}): void {
        const el = zone === 'self' ? this.el : this.getNodeEl(zone);
        if (!el) return;
        this._initDropZone(zone, el, options);
    },

    detachDropZone(zone: string): void {
        this._disposeDropZone(zone);
    },

    setDropZone(enabled: boolean, config?: DropOptions): void {
        const zone = config?.zone || this.dropZone || 'self';

        if (enabled) {
            const el = zone === 'self' ? this.el : this.getNodeEl(zone);
            if (!el) return;
            this._initDropZone(zone, el, config || {});
        } else {
            this.detachDropZone(zone);
        }
    },
} satisfies AbilityDefinition;
