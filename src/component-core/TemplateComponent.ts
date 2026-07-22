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
 * TemplateComponent 不再提供 withTemplate / replace，
 * 这些工厂方法已移至 Component。
 */

import { ComposableBase, type AbilityDefinition } from '@/composable';
import {
    EventAbility,
    DomEventsAbility,
    EventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    DragEventBusAbility,
    SystemEventBusAbility,
} from '@/system-abilities';
import { EventForwardAbility } from './abilities/EventForwardAbility';
import { NodePropAbility } from './abilities/NodePropAbility';

import type { NodeMetadata } from './types/compiled-types';
import { CommonPropsAbility } from './abilities/CommonPropsAbility';
import { AnimationAbility } from './abilities';

import { LifecycleAbility } from './abilities/LifecycleAbility';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';

/**
 * 标准能力声明
 *
 * 事件系统：EventAbility / DomEventsAbility / SystemEventBridgeAbility / EntityEventBusAbility / OverlayEventBusAbility / SystemEventBusAbility
 * 事件转发：EventForwardAbility
 * 节点属性：NodePropAbility（含脏追踪 + 批量写 DOM）
 * 生命周期：LifecycleAbility（mounted/updated/resize 事件发送）
 */
export const TEMPLATE_COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility,
    DomEventsAbility,
    EventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    DragEventBusAbility,
    SystemEventBusAbility,
    EventForwardAbility,
    NodePropAbility,
    CommonPropsAbility,
    AnimationAbility,

    LifecycleAbility,
];

export class TemplateComponent extends ComposableBase.with(TEMPLATE_COMPONENT_ABILITIES) {
    tag: string = 'div';

    type!: string;

    template?: string;

    el!: HTMLElement;

    meta: Record<string, any> = {};

    props: Record<string, any> = {};

    _initializing: boolean = false;

    _dirtyNodes: Record<string, Record<string, any>> = {};

    nodeMap: Record<string, NodeMetadata> = {};

    override dispose(): void {
        if (typeof this.onBeforeUnmount === 'function') {
            this.onBeforeUnmount();
        }

        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.BEFORE_UNMOUNT);

        this.onBeforeDispose();

        this._disposeChildComponents();

        this.el?.remove();

        this.meta = {};
        this.props = {};
        this._dirtyNodes = {};
        this.nodeMap = {};

        this._initializing = false;

        super.dispose();

        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.DISPOSE);
    }

    private _disposeChildComponents(): void {
        for (const node of Object.values(this.nodeMap)) {
            if (node.component && typeof node.component.dispose === 'function') {
                node.component.dispose();
            }
        }
    }
}
