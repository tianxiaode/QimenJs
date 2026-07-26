/**
 * ResizeAbility — 四边/四角拖动调整大小能力
 *
 * 为组件提供可拖拽的边缘和角点手柄，通过拖动改变组件宽高。
 * 内部使用 component.bind(el, 'drag') 走 DragProcessor，
 * 不依赖 DragDispatchCenter，自管理手柄 DOM 和拖拽逻辑。
 *
 * 使用方式：
 * 1. 组件声明 .with([ResizeAbility])
 * 2. 构造时调用 initResize(config?) 初始化
 * 3. 通过 resizable getter 控制启用/禁用
 * 4. 监听 'resize' 事件获取尺寸变化
 *
 * @example
 * ```ts
 * const Dialog = Component.withTemplate(TPL).with([ResizeAbility]);
 *
 * // body 中
 * onAfterInit(props) {
 *     this.initResize({ edges: ['n', 's', 'e', 'w', 'se'] });
 * }
 *
 * // 监听
 * this.on('resize', ({ width, height }) => { ... });
 * ```
 */

import type { AbilityDefinition } from '@/composable';

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeConfig {
    edges?: ResizeEdge[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}

interface ResizeState {
    edges: ResizeEdge[];
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    handles: Map<string, HTMLElement>;
    enabled: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    activeEdge: ResizeEdge | null;
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
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            activeEdge: null,
        };

        this.setAbilityState(STATE_KEY, state);

        for (const edge of state.edges) {
            const handle = document.createElement('div');
            handle.className = `q-resize-handle q-resize-handle--${edge}`;
            handle.style.cursor = edgeToCursor(edge);
            handle.dataset.resizeEdge = edge;

            this.el.appendChild(handle);
            state.handles.set(edge, handle);

            this.bind(handle, 'drag');
        }

        this.on('dom:drag', (ctx: any) => {
            this._onResizeDrag(ctx);
        });

        this.onCleanup(() => this._cleanupHandles());

        this.addCls('q-resizable');
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

    _onResizeDrag(ctx: any): void {
        const state = this.abilityState(STATE_KEY) as ResizeState | undefined;
        if (!state || !state.enabled) return;

        const target = ctx?.originalEvent?.target as HTMLElement | null;
        const edge = target?.dataset?.resizeEdge as ResizeEdge | undefined;
        if (!edge || !state.handles.has(edge)) return;

        const phase = ctx?.phase;

        if (phase === 'start') {
            state.startX = ctx.dx ?? 0;
            state.startY = ctx.dy ?? 0;
            state.startWidth = this.el.offsetWidth;
            state.startHeight = this.el.offsetHeight;
            state.activeEdge = edge;
            this.el.classList.add('q-resizable--active');
        } else if (phase === 'move' && state.activeEdge) {
            const dx = (ctx.dx ?? 0) - state.startX;
            const dy = (ctx.dy ?? 0) - state.startY;

            let newWidth = state.startWidth;
            let newHeight = state.startHeight;

            if (edge.includes('e')) newWidth = state.startWidth + dx;
            if (edge.includes('w')) newWidth = state.startWidth - dx;
            if (edge.includes('s')) newHeight = state.startHeight + dy;
            if (edge.includes('n')) newHeight = state.startHeight - dy;

            newWidth = Math.max(state.minWidth, Math.min(state.maxWidth, newWidth));
            newHeight = Math.max(state.minHeight, Math.min(state.maxHeight, newHeight));

            this.el.style.width = `${newWidth}px`;
            this.el.style.height = `${newHeight}px`;

            this.emit('resize', { width: newWidth, height: newHeight, edge });
        } else if (phase === 'end' || phase === 'cancel') {
            state.activeEdge = null;
            this.el.classList.remove('q-resizable--active');
        }
    },

    _cleanupHandles(): void {
        const state = this.abilityState(STATE_KEY) as ResizeState | undefined;
        if (!state) return;
        for (const [, handle] of state.handles) {
            handle.remove();
        }
        state.handles.clear();
    },
} satisfies AbilityDefinition;
