/**
 * Component — 组件基类
 *
 * 所有组件直接 extends Component，通过实例字段声明 tpl/events/type 等。
 * 构造函数启动异步初始化管线，el 立即可用。
 *
 * 生命周期：
 *   new Component(props)  →  Phase 1+2 同步（el 就绪）  →  Phase 3 异步（子组件实例化）  →  Phase 4 收尾
 *   component.ready       →  Promise<void>，等全部阶段完成
 *
 * @example
 * ```ts
 * class ButtonComponent extends Component {
 *     static templateName = 'Button';
 *     type = 'Button';
 * }
 * const btn = new ButtonComponent({ text: 'OK' });
 * container.appendChild(btn.el);   // 骨架立即可见
 * await btn.ready;                 // 等子组件 + 收尾
 * ```
 */

import {
    ComposableBase,
    withAbilities,
    type AbilityDefinition,
    type InferAbility,
} from '@/composable';
import {
    EventAbility,
    DomEventsAbility,
    EventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    DragEventBusAbility,
    SystemEventBusAbility,
    SystemAbility,
    DebounceAbility,
} from '@/system-abilities';

import { NodePropAbility } from './abilities/NodePropAbility';
import { CommonPropsAbility } from './abilities/CommonPropsAbility';
import { AnimationAbility } from './abilities';
import { LifecycleAbility } from './abilities/LifecycleAbility';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';

import type { NodeMetadata } from './types/compiled-types';
import type { INodeMapManager } from './types/node-map-manager-types';
import type { ComponentProps } from './types/init-context';
import { createInitContext } from './types/init-context';

import {
    MOUNT_PHASE,
    FILL_PHASE,
    INSTANTIATE_PHASE,
    FINALIZE_PHASE,
    runPhase,
} from './engine/pipeline';
import { getId } from '@/utils/string/id';

// ══════════════════════════════════════════════════════════════

export const COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility,
    DomEventsAbility,
    EventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    DragEventBusAbility,
    SystemEventBusAbility,
    SystemAbility,
    DebounceAbility,

    NodePropAbility,
    CommonPropsAbility,
    AnimationAbility,

    LifecycleAbility,
];

// ══════════════════════════════════════════════════════════════
// 类型声明合并
// ══════════════════════════════════════════════════════════════

export interface Component
    extends
        InferAbility<typeof EventAbility>,
        InferAbility<typeof DomEventsAbility>,
        InferAbility<typeof EventBridgeAbility>,
        InferAbility<typeof EntityEventBusAbility>,
        InferAbility<typeof OverlayEventBusAbility>,
        InferAbility<typeof DragEventBusAbility>,
        InferAbility<typeof SystemEventBusAbility>,
        InferAbility<typeof SystemAbility>,
        InferAbility<typeof DebounceAbility>,
        InferAbility<typeof NodePropAbility>,
        InferAbility<typeof CommonPropsAbility>,
        InferAbility<typeof AnimationAbility>,
        InferAbility<typeof LifecycleAbility> {
    onBeforeUnmount?(): void;
    onAfterInit?(props?: ComponentProps): void;
    onBeforeInit?(props?: ComponentProps): void;
    onMounted?(): void;
    onUpdated?(data?: any): void;
    onResize?(entry: ResizeObserverEntry): void;
    onInitState?(): Record<string, any>;
    onLocaleChange?(): void;
}

// ══════════════════════════════════════════════════════════════
// Component 基类
// ══════════════════════════════════════════════════════════════

export class Component extends ComposableBase {
    type: string;

    el!: HTMLElement;
    meta: Record<string, any>;
    props: ComponentProps;
    nodeMap: Record<string, NodeMetadata>;
    nodeMapMgr!: INodeMapManager;

    _initializing: boolean;
    _templateInitialized: boolean;
    _dirtyNodes: Record<string, Record<string, any>>;
    dirtySet!: Set<string>;

    private _ready: Promise<void> = Promise.resolve();

    constructor(props?: ComponentProps) {
        super();
        this.type = (this.constructor as any).name.replace(/Component$/, '');
        this.props = props ?? {};
        this.meta = {};
        this._dirtyNodes = {};
        this.nodeMap = {};
        this.dirtySet = new Set();
        this._initializing = true;
        this._ready = this.init();
    }

    get ready(): Promise<void> {
        return this._ready;
    }

    /**
     * 异步初始化管线
     *
     * Phase 1: MOUNT — 同步（首个 await 前，el 立即可用）
     * Phase 2: FILL — 同步
     * Phase 3: INSTANTIATE — 异步（Promise.all）
     * Phase 4: FINALIZE — 同步
     */
    async init(): Promise<void> {
        const ctx = createInitContext(this, this.props);

        try {
            runPhase(MOUNT_PHASE, ctx);
            if (!ctx.nodeMapMgr) return;

            runPhase(FILL_PHASE, ctx);

            // Phase 3: INSTANTIATE — 异步
            // await Promise.all(childSlots.map(s => this._instantiateChild(s)));

            runPhase(FINALIZE_PHASE, ctx);

            this.id = this.props.id || getId('cmp');
        } finally {
            this._initializing = false;
            this._flushNodeProps?.();
        }
    }

    containsElement(nodeName: string, target: Element): boolean {
        const node = this.nodeMap[nodeName];
        if (!node) return false;
        const el = node.component ? node.component.el : node.el;
        return el ? el.contains(target) : false;
    }

    override onBeforeDispose(): void {
        if (typeof this.onBeforeUnmount === 'function') {
            this.onBeforeUnmount();
        }

        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.BEFORE_UNMOUNT);

        this._disposeChildComponents();

        this.el?.remove();

        this.meta = {};
        this.props = {};
        this._dirtyNodes = {};
        this.nodeMap = {};

        this._initializing = false;
    }

    override onDisposed(): void {
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.DISPOSE);
    }

    private _disposeChildComponents(): void {
        this.nodeMapMgr.disposeAll();
    }
}

Component.use(COMPONENT_ABILITIES);
