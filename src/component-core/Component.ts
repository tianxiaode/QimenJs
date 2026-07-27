/**
 * Component — 组件基类
 *
 * 所有组件直接 extends Component，通过实例字段声明 tpl/events/type 等。
 * 首次 create() 时自动编译模板，WeakMap 缓存编译产物。
 *
 * tpl 三种语义：
 *   - { tag, children } → 全编译
 *   - { replace: true, nodeName: { tag, ... } } → 子树替换
 *   - { replace: true, nodeName: { type, ... } } → 属性覆盖
 *   - 无 tpl → 继承父类编译产物
 *
 * @example
 * ```ts
 * class ButtonComponent extends Component {
 *     type = 'Button';
 *     tpl = { tag: 'div', cls: 'q-button', children: [...] };
 *     events = { '': { click: { emits: ['click'] } } };
 *     use = [SizeAbility];
 * }
 * const btn = ButtonComponent.create({ text: 'OK' });
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
import type { TplNode } from './types';
import type { TplEvents } from './types/tpl-events';
import type { NodeMapManager } from './NodeMapManager';

import { CompileEngine } from './engine/CompileEngine';
import { EventEngine } from './engine/EventEngine';
import { applyChildNodeProps } from './engine/ChildNodeProps';
import { RuntimeEngine } from './engine/RuntimeEngine';
import { TemplateRegistrar } from './engine/TemplateRegistrar';

// ══════════════════════════════════════════════════════════════

// 默认能力
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
    onAfterInit?(props?: any): void;
    onBeforeInit?(props?: any): void;
    onMounted?(): void;
    onUpdated?(data?: any): void;
    onResize?(entry: ResizeObserverEntry): void;
    onInitState?(): Record<string, any>;
    onLocaleChange?(): void;
}

// ══════════════════════════════════════════════════════════════
// Component 基类
// ══════════════════════════════════════════════════════════════

const SKELETON_CLS = 'q-skeleton';

export class Component extends ComposableBase {
    tag: string = 'div';

    /**
     * 组件类型 — 由构造函数从类名自动推导
     * ButtonComponent → Button
     */
    type: string;

    template?: string;

    static templateName?: string;

    constructor(props?: Record<string, any>) {
        super();
        this.type = (this.constructor as any).name.replace(/Component$/, '');
    }

    /**
     * 静态能力注入 — 预编译阶段将能力方法复制到原型
     * 支持单个能力或数组，返回自身供链式调用
     *
     * @example
     * ```ts
     * ButtonComponent.use(SizeAbility);
     * ButtonComponent.use([SizeAbility, AnotherAbility]);
     * // 类型推断需手动 interface merge:
     * // interface ButtonComponent extends InferAbility<typeof SizeAbility> {}
     * ```
     */
    static use(abilities: AbilityDefinition | AbilityDefinition[]): typeof Component {
        const arr = Array.isArray(abilities) ? abilities : [abilities];
        withAbilities(this, arr);
        return this;
    }

    /**
     * 工厂创建 — 推荐方式
     *
     * 从 TemplateRegistrar 获取编译产物，注入到 ctor，然后初始化。
     * 传入 { progressive: true } 只完成 mount 阶段。
     */
    static create(
        this: any,
        props?: Record<string, any>,
        options?: { progressive?: boolean }
    ): any {
        const inst = new this(props);
        const ctor = inst.constructor;

        Component._ensureFromRegistry(ctor);

        if (!inst._initializing && !inst.el) {
            if (options?.progressive) {
                RuntimeEngine.mount(inst, props);
            } else {
                RuntimeEngine.init(inst, props);
            }
        }
        return inst;
    }

    /**
     * 从 TemplateRegistrar 注入编译产物到 ctor
     */
    static _ensureFromRegistry(ctor: any): void {
        if (ctor._compiled) return;

        const templateName = ctor.templateName;
        if (!templateName) return;

        const registry = TemplateRegistrar.getInstance();
        const compiled = registry.get(templateName);
        if (!compiled) return;

        ctor._cache = compiled.cache;
        ctor._nodeMetas = compiled.nodeMetas;
        ctor._compiled = true;
        ctor._templateCompiled = true;
    }

    /**
     * 渐进渲染 — 阶段2：填充内容
     * 在 create({ progressive: true }) 后调用。
     */
    fill(props?: Record<string, any>): void {
        RuntimeEngine.fill(this, props ?? this.props);
    }

    /**
     * 渐进渲染 — 阶段3：实例化子组件（替换 skeleton 占位）
     */
    instantiate(props?: Record<string, any>): void {
        RuntimeEngine.instantiate(this, props ?? this.props);
    }

    /**
     * 渐进渲染 — 阶段4：收尾
     */
    finalize(props?: Record<string, any>): void {
        RuntimeEngine.finalize(this, props ?? this.props);
    }

    el!: HTMLElement;

    meta: Record<string, any> = {};

    props: Record<string, any> = {};

    _initializing: boolean = false;

    _dirtyNodes: Record<string, Record<string, any>> = {};

    nodeMap: Record<string, NodeMetadata> = {};

    nodeMapMgr!: NodeMapManager;

    _templateInitialized: boolean = false;

    _skeletonActive: boolean = false;

    _skeletonManual: boolean = false;

    get skeleton(): boolean {
        return this._skeletonActive;
    }

    set skeleton(value: boolean) {
        const ctor = this.constructor as any;
        const skeletonPaths = ctor._cache?.skeletonPaths;
        if (!skeletonPaths || Object.keys(skeletonPaths).length === 0) return;

        if (this._skeletonActive === value) return;

        this._skeletonManual = true;

        if (value) {
            this._applySkeletonByPaths(skeletonPaths);
        } else {
            this._removeSkeletonByPaths(skeletonPaths);
        }

        this._skeletonActive = value;
    }

    containsElement(nodeName: string, target: Element): boolean {
        const node = this.nodeMap[nodeName];
        if (!node) return false;
        const el = node.component ? node.component.el : node.el;
        return el ? el.contains(target) : false;
    }

    _applySkeletonByPaths(skeletonPaths: Record<string, number[]>): void {
        for (const [name, path] of Object.entries(skeletonPaths)) {
            if (name === 'root') {
                this.el.classList.add(SKELETON_CLS);
                continue;
            }
            const el = this.nodeMap[name]?.el;
            if (el) el.classList.add(SKELETON_CLS);
        }
    }

    _removeSkeletonByPaths(skeletonPaths: Record<string, number[]>): void {
        for (const [name] of Object.entries(skeletonPaths)) {
            if (name === 'root') {
                this.el.classList.remove(SKELETON_CLS);
                continue;
            }
            const el = this.nodeMap[name]?.el;
            if (el) el.classList.remove(SKELETON_CLS);
        }
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

withAbilities(Component, COMPONENT_ABILITIES);

// 向后兼容别名
export const TEMPLATE_COMPONENT_ABILITIES = COMPONENT_ABILITIES;
