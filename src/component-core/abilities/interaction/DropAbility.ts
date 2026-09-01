import type { AbilityDefinition } from '@/composable';
import { dragStateManager } from '../../engine';
import type { DropOptions } from '../../types';

export const DropAbility: AbilityDefinition = {
    _commitDrops(): void {
        const dropMode = this.drop;
        const zone = this.dropZone || 'self';

        if (dropMode === false || dropMode === null || dropMode === undefined) {
            this._disposeDropZone(zone);
            return;
        }

        const el = this.el;
        if (!el) return;

        const config = typeof dropMode === 'object' ? dropMode : {};
        this._initDropZone(zone, el, config);
    },

    _initDropZone(zone: string, el: HTMLElement, config: DropOptions): void {
        this._disposeDropZone(zone);

        this._dropConfig = config;
        this._dropZone = zone;
        this._dropEl = el;
        this._dropEntered = false;

        this.bind(el, 'pointerenter');
        this.bind(el, 'pointerleave');

        this._dropEnterHandler = () => {
            if (!dragStateManager.isDragging()) return;

            const activeDrag = dragStateManager.getActiveDrag();
            if (!activeDrag) return;

            const accept = config.accept;
            if (accept && accept.length > 0) {
                if (!activeDrag.dragType || !accept.includes(activeDrag.dragType)) {
                    return;
                }
            }

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

        this.on('dom:pointerenter', this._dropEnterHandler);
        this.on('dom:pointerleave', this._dropLeaveHandler);

        this.onCleanup(() => this._disposeDropZone(zone));
    },

    _disposeDropZone(zone: string): void {
        if (this._dropEnterHandler) {
            this.off('dom:pointerenter', this._dropEnterHandler);
            this._dropEnterHandler = undefined;
        }
        if (this._dropLeaveHandler) {
            this.off('dom:pointerleave', this._dropLeaveHandler);
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
        const el = this.el;
        if (!el) return;
        this._initDropZone(zone, el, options);
    },

    detachDropZone(zone: string): void {
        this._disposeDropZone(zone);
    },

    setDropZone(enabled: boolean, config?: DropOptions): void {
        const zone = this.dropZone || 'self';

        if (enabled) {
            const el = this.el;
            if (!el) return;
            this._initDropZone(zone, el, config || {});
        } else {
            this.detachDropZone(zone);
        }
    },
} satisfies AbilityDefinition;
