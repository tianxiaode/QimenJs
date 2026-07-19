/**
 * TemplateComponent — 模板组件基类
 *
 * 通过 ComposableBase.with() 合并标准能力到原型上，
 * 再添加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - dispose：销毁清理
 *
 * 节点属性读写、脏追踪、批量更新由 NodePropAbility 提供。
 * withTemplate / replace 使用扁平复制（非继承），避免链式污染。
 */

import { ComposableBase, type AbilityDefinition } from '@/composable';
import {
    EventAbility,
    DomEventsAbility,
    EventBridgeAbility as SystemEventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    SystemEventBusAbility,
} from '@/system-abilities';
import { EventForwardAbility } from './abilities/EventForwardAbility';
import { NodePropAbility } from './abilities/NodePropAbility';
import { ComponentRegistrar } from './ComponentRegistrar';
import type { NodeMetadata } from './types/compiled-types';
import type { ComponentTemplate } from './types/component-template';
import { createTemplateClass, createReplaceClass } from './utils/template-factory';

/**
 * 标准能力声明
 *
 * 事件系统：EventAbility / DomEventsAbility / SystemEventBridgeAbility / EntityEventBusAbility / OverlayEventBusAbility / SystemEventBusAbility
 * 事件转发：EventForwardAbility
 * 节点属性：NodePropAbility（含脏追踪 + 批量写 DOM）
 */
export const TEMPLATE_COMPONENT_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility,
    DomEventsAbility,
    SystemEventBridgeAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    SystemEventBusAbility,
    EventForwardAbility,
    NodePropAbility,
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
        if (typeof this.onBeforeDispose === 'function') {
            this.onBeforeDispose();
        }

        ComponentRegistrar.getInstance().unregisterInstance(this);

        if (typeof this._disposeChildComponents === 'function') {
            this._disposeChildComponents();
        }

        this.el?.remove();

        this.meta = {};
        this.props = {};
        this._dirtyNodes = {};
        this.nodeMap = {};

        this._initializing = false;

        super.dispose();

        if (typeof this.onDisposed === 'function') {
            this.onDisposed();
        }
    }

    static withTemplate(this: any, template: ComponentTemplate): any {
        return createTemplateClass(this, template);
    }

    static replace(
        this: any,
        options: {
            type?: string;
            cls?: string;
            itemsCls?: string;
            config?: Record<string, any>;
            body?: Record<string, any>;
        }
    ): any {
        return createReplaceClass(this, options);
    }
}
