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
import type { NodeMetadata } from '../types/compiled-types';

/** 节点查询与解析能力，提供 nodeMap 只读访问、节点目标解析与 DOM 包含判定 */
export const NodeQueryAbility: AbilityDefinition = {
    /**
     * 所有节点的元数据映射表
     *
     * @returns 节点名到节点元数据的映射对象
     */
    nodeMap: {
        get(this: any): Record<string, NodeMetadata> {
            return this.nodeMapMgr?.getAll() ?? {};
        },
    },

    /**
     * 获取指定节点的组件实例或 DOM 元素
     *
     * 节点有子组件时返回组件实例，否则返回节点的 DOM 元素。
     *
     * @param name - 节点名称
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
    getNode(this: any, name: string): any | undefined {
        const node = this.nodeMap?.[name];
        if (!node) return undefined;
        return node.component ?? node.el;
    },

    /**
     * 判定目标元素是否包含在指定节点的 DOM 内
     *
     * @param nodeName - 节点名称
     * @param target - 待判定的目标元素
     * @returns 是否包含
     */
    containsElement(this: any, nodeName: string, target: Element): boolean {
        const node = this.nodeMap?.[nodeName];
        if (!node) return false;
        const el = node.component ? node.component.el : node.el;
        return el ? el.contains(target) : false;
    },

    /**
     * 解析节点的 DOM 元素
     *
     * 根据节点名称从 nodeMap 中获取对应的 DOM 元素。
     * 如果节点是子组件，返回子组件的 el；否则返回节点的 el。
     *
     * @param nodeName - 节点名称（如 'root', 'icon'）
     * @returns DOM 元素，节点不存在时返回 undefined
     *
     * @example
     * const el = this._resolveNodeEl('icon');
     * if (el) {
     *     el.style.color = 'red';
     * }
     */
    _resolveNodeEl(this: any, nodeName: string): HTMLElement | undefined {
        const node = this.nodeMap?.[nodeName];
        if (!node) return undefined;
        return node.component ? node.component.el : node.el;
    },

    /**
     * 解析节点的目标信息
     *
     * 根据节点名称从 nodeMap 中获取节点的 el 和 component 信息。
     * 用于确定操作目标是子组件还是 DOM 元素。
     *
     * @param nodeName - 节点名称（如 'root', 'icon'）
     * @returns 节点目标信息
     *
     * @example
     * const { el, component } = this._resolveNodeTarget('icon');
     * if (component) {
     *     component.hidden = true;
     * } else if (el) {
     *     el.hidden = true;
     * }
     */
    _resolveNodeTarget(this: any, nodeName: string): { el?: HTMLElement; component?: any } {
        const node = this.nodeMap?.[nodeName];
        if (!node) return {};
        return { el: node.el, component: node.component };
    },
};
