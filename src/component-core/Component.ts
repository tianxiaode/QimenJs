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
import type { DomEventsMap } from './types/tpl-events';
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

    onLocaleChange?(): void;
}

// ══════════════════════════════════════════════════════════════
// Component 基类
// ══════════════════════════════════════════════════════════════

export class Component extends ComposableBase {
    static get type(): string {
        return (this as any).name.replace(/Component$/, '');
    }

    type: string;

    /**
     * 语义动作名 — 组件实例级属性
     *
     * 构造时可从 props 传入，运行时可通过 setter 更改。
     * DomEventsEngine 第三层 key 匹配此值。
     *
     * @example
     * new ButtonComponent({ action: 'save' });
     * btn.action = 'create';  // 运行时更改
     */
    action: string;

    domEvents?: DomEventsMap;
    bridgeKey?: string | { key: string; fixed?: boolean };
    entityKey?: string | { key: string; fixed?: boolean };

    /**
     * 默认事件数据 — getter，子类 super 合并
     *
     * @example
     * class FormComponent extends Component {
     *     get defaultEventData() {
     *         return { ...super.defaultEventData, formId: this.formId };
     *     }
     * }
     */
    get defaultEventData(): Record<string, any> {
        return {};
    }

    /**
     * 自定义事件数据 — body 中定义，编译时挂原型
     *
     * 与 defaultEventData 分离：defaultEventData 是类继承链，
     * getCustomEventData 是组件实例级别的动态数据。
     */
    getCustomEventData(): Record<string, any> {
        return {};
    }

    el!: HTMLElement;
    meta: Record<string, any>;
    props: ComponentProps;
    nodeMapMgr!: INodeMapManager;

    get isItemContainer(): boolean {
        return false;
    }

    parent?: any;
    slotName?: string;

    _initializing: boolean;
    _templateInitialized: boolean = false;
    _dirtyNodes: Record<string, Record<string, any>>;
    _disposing: boolean;
    dirtySet!: Set<string>;

    private _ready: Promise<void> = Promise.resolve();

    constructor(props?: ComponentProps) {
        super();
        this.type = (this.constructor as any).name.replace(/Component$/, '');
        this.props = props ?? {};
        this.action = this.props.action ?? '';
        this.parent = this.props.parent;
        this.slotName = this.props.slotName;
        this.meta = {};
        this._dirtyNodes = {};
        this.dirtySet = new Set();
        this._initializing = true;
        this._disposing = false;
        this._ready = this.init();
    }

    get nodeMap(): Record<string, NodeMetadata> {
        return this.nodeMapMgr?.getAll() ?? {};
    }

    get ready(): Promise<void> {
        return this._ready;
    }

    get readyAll(): Promise<void> {
        return this._readyAll();
    }

    private async _readyAll(): Promise<void> {
        await this._ready;
        const mgr = this.nodeMapMgr;
        if (!mgr) return;
        for (const node of Object.values(mgr.getAll())) {
            if (node.component && typeof (node.component as any).readyAll === 'function') {
                await (node.component as any).readyAll;
            } else if (node.component && (node.component as any).ready) {
                await (node.component as any).ready;
            }
        }
    }

    /**
     * 异步初始化管线
     *
     * Phase 1: MOUNT — 同步（首个 await 前，el 立即可用）
     * Phase 2: FILL — 同步
     * Phase 3: INSTANTIATE — 异步（TaskQueue 队列化子组件渲染）
     * Phase 4: FINALIZE — 同步
     */
    async init(): Promise<void> {
        const ctx = createInitContext(this, this.props);

        try {
            await runPhase(MOUNT_PHASE, ctx);
            if (!ctx.nodeMapMgr) return;

            if (FILL_PHASE.steps.length > 0) {
                await runPhase(FILL_PHASE, ctx);
            }

            await runPhase(INSTANTIATE_PHASE, ctx);

            await runPhase(FINALIZE_PHASE, ctx);

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
        this._disposing = true;

        if (typeof this.onBeforeUnmount === 'function') {
            this.onBeforeUnmount();
        }

        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.BEFORE_UNMOUNT);

        if (this.parent && this.slotName && !this.parent._disposing && !this.isItemContainer) {
            const parentNodeMapMgr = this.parent.nodeMapMgr;
            if (parentNodeMapMgr) {
                const node = parentNodeMapMgr.get(this.slotName);
                if (node && node.component === this) {
                    parentNodeMapMgr.restoreSkeleton(this.slotName);
                }
            }
        }

        this._disposeChildComponents();

        if (this.el?.parentElement) {
            this.el.remove();
        }

        this.meta = {};
        this.props = {};
        this._dirtyNodes = {};

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
