/**
 * NodeQueryAbility — 节点查询与解析能力
 *
 * 提供节点映射表的只读访问、节点目标解析与 DOM 包含判定：
 *   nodeMap                → 所有节点的元数据映射（getter）
 *   getNode(name)          → 返回节点的 component（优先）或 el
 *   containsElement(name, target) → 判定 target 是否处于节点 DOM 内
 *   _resolveNodeEl(name)   → 解析节点的 DOM 元素（子组件取其 el）
 *   _resolveNodeTarget(name) → 解析节点的 { el, component } 目标信息
 *
 * NodePropAbility / CommonPropsAbility 通过 this._resolveNodeTarget /
 * this._resolveNodeEl 跨能力调用本能力的方法。
 */

import type { AbilityDefinition } from '@/composable';
import { NodeMeta } from '../types';

/** 节点查询与解析能力，提供 nodeMap 只读访问、节点目标解析与 DOM 包含判定 */
export const NodeQueryAbility: AbilityDefinition = {
    i18ns: {
        get() {
            return this.nodeManager.i18ns;
        },
    },

    permissions: {
        get() {
            return this.nodeManager.permissions;
        },
    },

    el: {
        get() {
            return this.nodeManager.el;
        },
    },

    nodeMap: {
        get() {
            return this.nodeManager.map;
        },
    },

    /**
     * 获取指定节点的组件实例或 DOM 元素
     *
     * 节点有子组件时返回组件实例，否则返回节点的 DOM 元素。
     *
     * @param nodeName - 节点名称
     * @returns 组件实例或 DOM 元素，节点不存在时返回 undefined
     *
     * @example
     * ```ts
     * const header = this.getNode('header');
     * if (header) {
     *   header.title = 'New Title';
     * }
     * ```
     */
    getNode(nodeName: string): NodeMeta | undefined {
        return this.nodeManager.get(nodeName);
    },

    setNode(nodeName: string, node: NodeMeta) {
        this.nodeManager.set(nodeName, node);
    },

    updateNode(nodeName: string, node: Partial<NodeMeta>) {
        this.nodeManager.update(nodeName, node);
    },

    getNodeEl(nodeName: string): HTMLElement | undefined {
        return this.nodeManager.getNodeEl(nodeName);
    },

    getComponent(nodeName: string): any {
        return this.nodeManager.getComponent(nodeName);
    },

    getNodeOptions(nodeName: string): any {
        return this.nodeManager.getOptions(nodeName);
    },

    isComponent(nodeName: string): boolean {
        return this.nodeManager.isComponent(nodeName);
    },

    /**
     * 判定目标元素是否包含在指定节点的 DOM 内
     *
     * @param nodeName - 节点名称
     * @param target - 待判定的目标元素
     * @returns 是否包含
     */
    containsElement(nodeName: string, target: Element): boolean {
        const el = this.getNodeEl(nodeName);
        return el ? el.contains(target) : false;
    },
} satisfies AbilityDefinition;
