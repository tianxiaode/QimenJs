/**
 * TemplateComponent — 内部类基类（实现层）
 *
 * 拥有完整初始化流程、能力（Ability）、el、nodeMap。
 * 是真正被实例化的组件，外部拿到的就是这个实例。
 *
 * 双层架构：
 *   Component（闭包基类）— 工厂层，withTemplate / replace 在此
 *   TemplateComponent（内部类基类）— 实现层，纯组件基类
 *
 * 新模式：从 ComposableBase 派生，通过 withAbilities 附加能力。
 * withTemplate 时 class extends TemplateComponent，拆解模板并复制功能到新类。
 *
 * 类型策略：
 *   export interface TemplateComponent 声明合并，用 InferAbility<typeof XAbility>
 *   提取每个能力的公共签名，运行时由 withAbilities 注入实现。
 *   生命周期钩子声明为可选方法（组件 body 中按需定义）。
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

import type { NodeMetadata } from './types/compiled-types';
import { CommonPropsAbility } from './abilities/CommonPropsAbility';
import { AnimationAbility } from './abilities';
import { LifecycleAbility } from './abilities/LifecycleAbility';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';
import type { NodeMapManager } from './NodeMapManager';

export const TEMPLATE_COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
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

export interface TemplateComponent
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

const SKELETON_CLS = 'q-skeleton';

export class TemplateComponent extends ComposableBase {
    tag: string = 'div';

    type!: string;

    template?: string;

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

withAbilities(TemplateComponent, TEMPLATE_COMPONENT_ABILITIES);
