/**
 * TemplateComponent — 模板组件基类
 *
 * 通过 ComposableBase.with() 合并标准能力到原型上，
 * 再添加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - setProp：通用属性设置
 * - markDirty/flush：脏属性追踪 + 延时刷新
 * - dispose：销毁清理
 *
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
 * 节点属性：NodePropAbility
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

    dirtySet: Set<string> = new Set();

    _initializing: boolean = false;

    nodeMap: Record<string, NodeMetadata> = {};

    initElement(): void {
        this.el = document.createElement(this.tag);
    }

    markDirty(key: string): void {
        this.dirtySet.add(key);
        this.debounce('TemplateComponent:flush', () => this.flush(), 0);
    }

    flush(): void {
        if (this.dirtySet.size === 0) return;

        this.flushLayout();

        this.dirtySet.clear();
    }

    setProp(key: string, value: any): void {
        this.props[key] = value;
        if (!this._initializing) {
            this.markDirty(key);
        }
    }

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
        this.dirtySet.clear();
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
