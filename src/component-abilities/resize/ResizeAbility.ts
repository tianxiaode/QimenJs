/**
 * ResizeAbility — 四边/四角拖动调整大小能力
 *
 * 为组件提供可拖拽的边缘和角点手柄，通过拖动改变组件宽高。
 * 使用 DomEventsEngine 添加 press 规则替代 DragProcessor 手势绑定，
 * 拖动期间在 document 上监听 move/up，释放时自动清理。
 *
 * 使用方式：
 * 1. 组件声明 .with([ResizeAbility])
 * 2. 构造时调用 initResize(config?) 初始化
 * 3. 通过 resizable getter 控制启用/禁用
 * 4. 监听 'resize' 事件获取尺寸变化
 *
 * @example
 * ```ts
 * this.initResize({ edges: ['s', 'se', 'e'] });
 * this.on('resize', ({ width, height }) => { ... });
 * ```
 */

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
}

interface ResizeState {
    edges: ResizeEdge[];
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    handles: Map<string, HTMLElement>;
    enabled: boolean;
    startMouseX: number;
    startMouseY: number;
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
            startMouseX: 0,
            startMouseY: 0,
            startWidth: 0,
            startHeight: 0,
            activeEdge: null,
        };

        this.setAbilityState(STATE_KEY, state);

        const rules: { rule: any; handle: HTMLElement }[] = [];
        for (const edge of state.edges) {
            const handle = document.createElement('div');
            handle.className = `q-resize-handle q-resize-handle--${edge}`;
            handle.style.cursor = edgeToCursor(edge);
            handle.dataset.resizeEdge = edge;

            this.el.appendChild(handle);
            state.handles.set(edge, handle);

            const rule = {
                event: 'press',
                path: handle,
                handler: '_onResizePress',
                needsBinding: true,
            } as const;
            rules.push({ rule, handle });
            DomEventsEngine.addEventRule(this, rule);
        }

        this.addCls('q-resizable');

        this.onCleanup(() => {
            for (const { rule, handle } of rules) {
                DomEventsEngine.removeEventRule(this, rule);
                handle.remove();
            }
            state.handles.clear();
        });
    },

    _onResizePress(domEvt: any): void {
        const state = this.abilityState(STATE_KEY) as ResizeState | undefined;
        if (!state || !state.enabled) return;

        const oe = domEvt?.data?.originalEvent as PointerEvent | MouseEvent | undefined;
        if (!oe) return;
        const target = oe.target as HTMLElement | null;
        const edge = target?.dataset?.resizeEdge as ResizeEdge | undefined;
        if (!edge || !state.handles.has(edge)) return;

        state.startMouseX = oe.clientX;
        state.startMouseY = oe.clientY;
        state.startWidth = this.el.offsetWidth;
        state.startHeight = this.el.offsetHeight;
        state.activeEdge = edge;
        this.el.classList.add('q-resizable--active');

        const onMove = (e: PointerEvent | MouseEvent) => {
            const s = this.abilityState(STATE_KEY) as ResizeState | undefined;
            if (!s || !s.enabled || !s.activeEdge) return;

            const dx = e.clientX - s.startMouseX;
            const dy = e.clientY - s.startMouseY;

            let newWidth = s.startWidth;
            let newHeight = s.startHeight;

            if (edge.includes('e')) newWidth = s.startWidth + dx;
            if (edge.includes('w')) newWidth = s.startWidth - dx;
            if (edge.includes('s')) newHeight = s.startHeight + dy;
            if (edge.includes('n')) newHeight = s.startHeight - dy;

            newWidth = Math.max(s.minWidth, Math.min(s.maxWidth, newWidth));
            newHeight = Math.max(s.minHeight, Math.min(s.maxHeight, newHeight));

            this.el.style.width = `${newWidth}px`;
            this.el.style.height = `${newHeight}px`;

            this.emit('resize', { width: newWidth, height: newHeight, edge });
        };

        const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('mouseup', onUp);

            const s = this.abilityState(STATE_KEY) as ResizeState | undefined;
            if (!s || !s.activeEdge) return;
            s.activeEdge = null;
            this.el.classList.remove('q-resizable--active');
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('mouseup', onUp);
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
