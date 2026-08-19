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
import { IComponentCore, NodeMeta } from '../types';

/** 节点查询与解析能力，提供 nodeMap 只读访问、节点目标解析与 DOM 包含判定 */
export const NodeQueryAbility: AbilityDefinition = {
    rootTag: {
        get() {
            return this.getNode('root').tag || 'div';
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
        return this._tplCache.nodes[nodeName];
    },

    getNodeEl(nodeName: string): HTMLElement | undefined {
        let el = this.nodeElements[nodeName];
        if (el) return el;
        const index = this._getNodeIndex(nodeName);
        el = this._findByPath(index);
        this._setNodeEl(nodeName, el); // 缓存 DOM 元素
        return el;
    },

    _setNodeEl(nodeName: string, el: HTMLElement): void {
        this.nodeElements[nodeName] = el;
    },

    getComponent(nodeName: string): IComponentCore {
        return this.nodeInstances(nodeName);
    },

    _setComponent(nodeName: string, component: IComponentCore): void {
        this.nodeInstances[nodeName] = component;
    },

    isComponent(nodeName: string): boolean {
        return this.getNode(nodeName)?.isComponent || false;
    },

    _getNodeIndex(nodeName: string): number[] {
        return this._tplCache.indexs[nodeName] || [];
    },

    getNodeNames(): string[] {
        return this._tplCache.names;
    },

    getChildComponentNames(): string[] {
        return this._tplCache.childComponentNames;
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

    /**
     * 按子节点索引路径定位 DOM 元素
     *
     * @param root - 搜索起点元素
     * @param path - 子节点索引路径（由编译时 indexPath 产出）
     * @returns 定位到的 HTMLElement，路径不存在时返回 null
     *
     * @example
     * ```ts
     * // 编译时产出: indexPath['text'] = [0, 1]
     * // 运行时定位: const el = findByPath(rootEl, [0, 1])
     * ```
     */
    _findByPath(path: number[]): HTMLElement | null {
        let current: Element = this.el;
        for (const idx of path) {
            if (!current.children[idx]) return null;
            current = current.children[idx];
        }
        return current as HTMLElement;
    },
} satisfies AbilityDefinition;
