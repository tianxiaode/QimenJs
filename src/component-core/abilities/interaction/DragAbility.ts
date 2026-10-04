import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '../../ComponentRegistrar';
import { dragStateManager, EventForwarder } from '../../engine';
import type { DragOptions } from '../../types';

function _extractPointer(oe: any): { clientX: number; clientY: number } {
    if (oe?.clientX !== undefined) {
        return { clientX: oe.clientX, clientY: oe.clientY };
    }
    if (oe?.touches?.[0]) {
        return { clientX: oe.touches[0].clientX, clientY: oe.touches[0].clientY };
    }
    if (oe?.changedTouches?.[0]) {
        return { clientX: oe.changedTouches[0].clientX, clientY: oe.changedTouches[0].clientY };
    }
    return { clientX: 0, clientY: 0 };
}

export const DragAbility: AbilityDefinition = {
    _commitDrags(): void {
        const componentId = this.id;
        if (!componentId) return;

        const dragMode = this.drag;

        if (dragMode === false || dragMode === null || dragMode === undefined) {
            this._disposeDrag();
            return;
        }

        const config = typeof dragMode === 'object' && dragMode !== null ? dragMode : {};
        const handleEl = config.handle ? this.getNodeEl(config.handle) : undefined;
        this._initDrag(config, handleEl);
    },

    _initDrag(config: DragOptions, handleEl?: HTMLElement): void {
        const componentId = this.id;
        if (!componentId) return;

        this._disposeDrag();

        const el = handleEl ?? this.el;
        if (!el) return;

        this._dragConfig = config;
        this._dragEl = el;

        this._dragBindOff = this.bind(el, 'drag');

        this._dragHandler = (ctx: any) => {
            const gesture = ctx?.data ?? ctx;

            if (
                gesture.originalEvent?.target !== el &&
                !el.contains(gesture.originalEvent?.target)
            ) {
                return;
            }

            const phase = gesture.phase;

            if (phase === 'start') {
                this._onDragStart(gesture);
            } else if (phase === 'move') {
                this._onDragMove(gesture);
            } else if (phase === 'end') {
                this._onDragEnd(gesture);
            } else if (phase === 'cancel') {
                this._onDragCancel(gesture);
            }
        };
        this._dragHandlerOff = this.on('dom:drag', this._dragHandler);

        this.onCleanup(() => this._disposeDrag());
    },

    _disposeDrag(): void {
        const componentId = this.id;
        if (!componentId) return;

        if (this._dragHandlerOff) {
            this._dragHandlerOff();
            this._dragHandlerOff = undefined;
        }
        this._dragHandler = undefined;

        if (this._dragBindOff) {
            this._dragBindOff();
            this._dragBindOff = undefined;
        }

        if (this._dragConfig?.activeClass && this._dragEl) {
            this._dragEl.classList.remove(this._dragConfig.activeClass);
        }

        this._destroyGhost();

        if (
            dragStateManager.isDragging() &&
            dragStateManager.getActiveDrag()?.dragKey === componentId
        ) {
            dragStateManager.setActiveDrag(null);
        }

        this._dragConfig = undefined;
        this._dragEl = undefined;
    },

    _forwardDragEvent(config: any, phase: string, gesture: any): void {
        if (!config.emits && !config.bridges) return;
        const action = config.actionMap?.[phase] ?? `drag${phase.charAt(0).toUpperCase()}${phase.slice(1)}`;
        const pointer = _extractPointer(gesture.originalEvent);
        EventForwarder.forward(
            this,
            { emits: config.emits, bridges: config.bridges },
            { actionData: pointer },
            undefined,
            action
        );
    },

    _onDragStart(gesture: any): void {
        const componentId = this.id;
        const config = this._dragConfig;
        const el = this._dragEl;
        if (!config || !el) return;

        const dragType = config.type ?? this.type;

        dragStateManager.setActiveDrag({
            dragKey: componentId,
            dragType,
            dragData: config,
            dragEl: el,
            dragSource: this,
        });

        if (config.activeClass) el.classList.add(config.activeClass);

        this._createGhost();
        this._moveGhost(gesture);

        const startHandler = this.onDragStart;
        if (typeof startHandler === 'function') {
            startHandler.call(this, {
                dx: gesture.dx ?? 0,
                dy: gesture.dy ?? 0,
                el,
                originalEvent: gesture.originalEvent,
            });
        }

        this._forwardDragEvent(config, 'start', gesture);
    },

    _onDragMove(gesture: any): void {
        const config = this._dragConfig;
        const el = this._dragEl;
        if (!config || !el) return;

        this._moveGhost(gesture);

        const moveHandler = this.onDragMove;
        if (typeof moveHandler === 'function') {
            moveHandler.call(this, {
                dx: gesture.dx ?? 0,
                dy: gesture.dy ?? 0,
                el,
                originalEvent: gesture.originalEvent,
            });
        }

        this._forwardDragEvent(config, 'move', gesture);
    },

    _onDragEnd(gesture: any): void {
        const componentId = this.id;
        const config = this._dragConfig;
        const el = this._dragEl;
        if (!config || !el) return;

        this.emit('drag:end', {
            dragKey: componentId,
            dragType: dragStateManager.getActiveDrag()?.dragType,
            dragData: dragStateManager.getActiveDrag()?.dragData,
            originalEvent: gesture.originalEvent,
        });

        if (config.activeClass) el.classList.remove(config.activeClass);

        this._destroyGhost();
        dragStateManager.setActiveDrag(null);

        const endHandler = this.onDragEnd;
        if (typeof endHandler === 'function') {
            endHandler.call(this, {
                el,
                originalEvent: gesture.originalEvent,
            });
        }

        this._forwardDragEvent(config, 'end', gesture);
    },

    _onDragCancel(gesture: any): void {
        const componentId = this.id;
        const config = this._dragConfig;
        const el = this._dragEl;
        if (!config || !el) return;

        this.emit('drag:cancel', { dragKey: componentId });

        if (config.activeClass) el.classList.remove(config.activeClass);

        this._destroyGhost();
        dragStateManager.setActiveDrag(null);

        const cancelHandler = this.onDragCancel;
        if (typeof cancelHandler === 'function') {
            cancelHandler.call(this, { el });
        }

        this._forwardDragEvent(config, 'cancel', gesture);
    },

    _createGhost(): void {
        const config = this._dragConfig;
        if (!config?.ghost || this._ghostComponent) return;

        const ctor = ComponentRegistrar.getInstance().getByType(config.ghost);
        if (!ctor) return;

        const ghost = new (ctor as any)();
        if (!ghost?.el) return;

        ghost.el.style.position = 'fixed';
        ghost.el.style.pointerEvents = 'none';
        ghost.el.style.zIndex = '9999';
        document.body.appendChild(ghost.el);

        this._ghostComponent = ghost;
    },

    _moveGhost(gesture: any): void {
        const ghost = this._ghostComponent;
        if (!ghost) return;

        const x = gesture.originalEvent?.clientX ?? 0;
        const y = gesture.originalEvent?.clientY ?? 0;

        if (typeof ghost.update === 'function') {
            ghost.update(x, y);
        } else if (ghost.el) {
            ghost.el.style.left = `${x}px`;
            ghost.el.style.top = `${y}px`;
        }
    },

    _destroyGhost(): void {
        const ghost = this._ghostComponent;
        if (!ghost) return;

        this._ghostComponent = undefined;
        ghost.el?.remove?.();
        ghost.dispose?.();
    },

    startDrag(): void {
        const componentId = this.id;
        if (!componentId) return;
        this.emit('drag:start', { dragKey: componentId, source: componentId });
    },

    stopDrag(): void {
        const componentId = this.id;
        if (!componentId) return;
        this.emit('drag:stop', { dragKey: componentId, source: componentId });
    },

    setDraggable(enabled: boolean, config?: DragOptions): void {
        this.drag = enabled ? (config ?? true) : false;
        this._commitDrags();
    },
} satisfies AbilityDefinition;
