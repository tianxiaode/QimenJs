import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import './resize.css';

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeConfig {
    edges?: ResizeEdge[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    emits?: string[];
    bridges?: string[];
    skipDomUpdate?: boolean;
    handle?: string;
}

interface ResizeState {
    edges: ResizeEdge[];
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    handles: Map<string, HTMLElement>;
    enabled: boolean;
    startWidth: number;
    startHeight: number;
    activeEdge: ResizeEdge | null;
    emits?: string[];
    bridges?: string[];
    skipDomUpdate: boolean;
    customHandle: boolean;
}

const STATE_KEY = 'ResizeAbility:state';

const EDGE_CURSORS: Record<ResizeEdge, string> = {
    n: 'ns-resize',
    s: 'ns-resize',
    e: 'ew-resize',
    w: 'ew-resize',
    ne: 'nesw-resize',
    nw: 'nwse-resize',
    se: 'nwse-resize',
    sw: 'nesw-resize',
};

const DEFAULT_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

function edgeToCursor(edge: ResizeEdge): string {
    return EDGE_CURSORS[edge];
}

export const ResizeAbility = {
    initResize(config?: ResizeConfig): void {
        const state: ResizeState = {
            edges: config?.edges ?? DEFAULT_EDGES,
            minWidth: config?.minWidth ?? 80,
            minHeight: config?.minHeight ?? 40,
            maxWidth: config?.maxWidth ?? Infinity,
            maxHeight: config?.maxHeight ?? Infinity,
            handles: new Map(),
            enabled: true,
            startWidth: 0,
            startHeight: 0,
            activeEdge: null,
            emits: config?.emits,
            bridges: config?.bridges,
            skipDomUpdate: config?.skipDomUpdate ?? false,
            customHandle: !!config?.handle,
        };

        this.setAbilityState(STATE_KEY, state);

        const rules: { rule: any; handle: HTMLElement; created: boolean }[] = [];

        if (config?.handle) {
            const existingEl = this.getNodeEl(config.handle);
            if (existingEl) {
                const edge = state.edges[0];
                existingEl.dataset.resizeEdge = edge;
                existingEl.style.cursor = edgeToCursor(edge);
                state.handles.set(edge, existingEl);

                const rule = {
                    event: 'drag',
                    path: existingEl,
                    handler: '_onResizeDrag',
                    needsBinding: true,
                    emits: state.emits,
                    bridges: state.bridges,
                } as const;
                rules.push({ rule, handle: existingEl, created: false });
                DomEventsEngine.addEventRule(this, rule);
            }
        } else {
            for (const edge of state.edges) {
                const handle = document.createElement('div');
                handle.className = `q-resize-handle q-resize-handle--${edge}`;
                handle.style.cursor = edgeToCursor(edge);
                handle.dataset.resizeEdge = edge;

                this.el.appendChild(handle);
                state.handles.set(edge, handle);

                const rule = {
                    event: 'drag',
                    path: handle,
                    handler: '_onResizeDrag',
                    needsBinding: true,
                    emits: state.emits,
                    bridges: state.bridges,
                } as const;
                rules.push({ rule, handle, created: true });
                DomEventsEngine.addEventRule(this, rule);
            }
        }

        this.addCls('q-resizable');

        this.onCleanup(() => {
            for (const { rule, handle, created } of rules) {
                DomEventsEngine.removeEventRule(this, rule);
                if (created) handle.remove();
            }
            state.handles.clear();
        });
    },

    _onResizeDrag(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as ResizeState | undefined;
        if (!state || !state.enabled) return;

        const phase = domEvt?.data?.phase;
        const oe = domEvt?.data?.originalEvent as PointerEvent | MouseEvent | undefined;

        if (phase === 'start') {
            const target = oe?.target as HTMLElement | null;
            const edge = target?.dataset?.resizeEdge as ResizeEdge | undefined;
            if (!edge || !state.handles.has(edge)) return;

            state.startWidth = this.el.offsetWidth;
            state.startHeight = this.el.offsetHeight;
            state.activeEdge = edge;
            this.el.classList.add('q-resizable--active');
        } else if (phase === 'move') {
            if (!state.activeEdge) return;

            const dx = domEvt.data.dx ?? 0;
            const dy = domEvt.data.dy ?? 0;
            const edge = state.activeEdge;

            let newWidth = state.startWidth;
            let newHeight = state.startHeight;

            if (edge.includes('e')) newWidth = state.startWidth + dx;
            if (edge.includes('w')) newWidth = state.startWidth - dx;
            if (edge.includes('s')) newHeight = state.startHeight + dy;
            if (edge.includes('n')) newHeight = state.startHeight - dy;

            newWidth = Math.max(state.minWidth, Math.min(state.maxWidth, newWidth));
            newHeight = Math.max(state.minHeight, Math.min(state.maxHeight, newHeight));

            if (!state.skipDomUpdate) {
                this.el.style.width = `${newWidth}px`;
                this.el.style.height = `${newHeight}px`;
            }

            if (state.emits || state.bridges) {
                domEvt.actionData = { width: newWidth, height: newHeight, edge };
            } else {
                this.emit('resize', { width: newWidth, height: newHeight, edge });
            }
        } else if (phase === 'end' || phase === 'cancel') {
            if (!state.activeEdge) return;
            state.activeEdge = null;
            this.el.classList.remove('q-resizable--active');
        }
    },

    get resizable(): boolean {
        const state = this.abilityState(STATE_KEY) as ResizeState | undefined;
        return state?.enabled ?? false;
    },

    set resizable(value: boolean) {
        const state = this.abilityState(STATE_KEY) as ResizeState | undefined;
        if (!state) return;
        state.enabled = value;
        for (const [, handle] of state.handles) {
            handle.style.display = value ? '' : 'none';
        }
        this.el.classList.toggle('q-resizable--disabled', !value);
    },
} satisfies AbilityDefinition;
