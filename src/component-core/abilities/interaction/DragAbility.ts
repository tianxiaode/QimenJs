import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '../../ComponentRegistrar';
import { dragStateManager } from '../../engine';
import type { DragOptions } from '../../types';

export const DragAbility: AbilityDefinition = {
    _commitDrags(): void {
        const componentId = this.id;
        console.log('[DragAbility] _commitDrags, id =', componentId, 'drag =', this.drag);
        if (!componentId) return;

        const dragMode = this.drag;

        if (dragMode === false || dragMode === null || dragMode === undefined) {
            this._disposeDrag();
            return;
        }

        const config = typeof dragMode === 'object' ? dragMode : {};
        console.log('[DragAbility] config =', config, 'config.handle =', config.handle);
        let handleEl: HTMLElement | undefined;
        try {
            handleEl = config.handle ? this.getNodeEl(config.handle) : undefined;
        } catch (e) {
            console.error('[DragAbility] getNodeEl error:', e);
        }
        console.log('[DragAbility] handleEl =', handleEl?.tagName, 'calling _initDrag...');
        this._initDrag(config, handleEl);
    },

    _initDrag(config: DragOptions, handleEl?: HTMLElement): void {
        const componentId = this.id;
        console.log('[DragAbility] _initDrag called, componentId =', componentId, 'handleEl =', handleEl?.tagName);
        if (!componentId) return;

        this._disposeDrag();

        const el = handleEl ?? this.el;
        if (!el) {
            console.log('[DragAbility] _initDrag: no el, abort');
            return;
        }

        console.log('[DragAbility] _initDrag, el =', el?.tagName, 'config =', config);
        this._dragConfig = config;
        this._dragEl = el;

        try {
            this.bind(el, 'drag');
            console.log('[DragAbility] bind(el, "drag") done');
        } catch (e) {
            console.error('[DragAbility] bind error:', e);
        }

        this._dragHandler = (gesture: any) => {
            console.log('[DragAbility] dom:drag received, phase =', gesture?.phase, 'target =', gesture?.originalEvent?.target);

            if (
                gesture.originalEvent?.target !== el &&
                !el.contains(gesture.originalEvent?.target)
            ) {
                console.log('[DragAbility] target not in el, skip');
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
        this.on('dom:drag', this._dragHandler);
        console.log('[DragAbility] on("dom:drag") registered');

        this.onCleanup(() => this._disposeDrag());
    },

    _disposeDrag(): void {
        const componentId = this.id;
        if (!componentId) return;

        if (this._dragHandler) {
            this.off('dom:drag', this._dragHandler);
            this._dragHandler = undefined;
        }

        if (this._dragConfig?.activeClass && this._dragEl) {
            this._dragEl.classList.remove(this._dragConfig.activeClass);
        }

        this._destroyGhost();

        if (dragStateManager.isDragging() && dragStateManager.getActiveDrag()?.dragKey === componentId) {
            dragStateManager.setActiveDrag(null);
        }

        this._dragConfig = undefined;
        this._dragEl = undefined;
    },

    _onDragStart(gesture: any): void {
        const componentId = this.id;
        const config = this._dragConfig;
        const el = this._dragEl;
        console.log('[DragAbility] _onDragStart, config =', config, 'el =', el?.tagName);
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
    },

    _onDragEnd(gesture: any): void {
        const componentId = this.id;
        const config = this._dragConfig;
        const el = this._dragEl;
        if (!config || !el) return;

        console.log('[DragAbility] _onDragEnd, emitting drag:end');
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
