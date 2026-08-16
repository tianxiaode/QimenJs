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
import { IComponentCore, NodeMeta, NodeOptions } from '../types';
import { _set } from 'zod/v4/core';

/** 节点查询与解析能力，提供 nodeMap 只读访问、节点目标解析与 DOM 包含判定 */
export const NodeQueryAbility: AbilityDefinition = {
    permissions: {
        get() {
            const names = this.state.permissions;
            const result = [];
            for (const name of names) {
                const node = this.getNode(name);
                if (node) {
                    result.push({ name, permissions: node.ermission });
                }
            }
        },
    },

    el: {
        get() {
            return this.getNodeEl('root');
        },
    },

    rootTag: {
        get() {
            return this.getNodeEl('root').tag || 'div';
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
        return this.state.nodes[nodeName];
    },

    getNodeEl(nodeName: string): HTMLElement | undefined {
        return this.state.elements(nodeName);
    },

    _setNodeEl(nodeName: string, el: HTMLElement): void {
        this.state.elements[nodeName] = el;
    },

    getComponent(nodeName: string): IComponentCore {
        return this.instances(nodeName);
    },

    getNodeOptions(nodeName: string): NodeOptions | undefined {
        return this.getNode(nodeName)?.options;
    },

    isComponent(nodeName: string): boolean {
        return this.getNode(nodeName)?.isComponent || false;
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

    _getState(nodeName: string) {
        return this.state.states[nodeName];
    },

    _getDirty(nodeName: string) {
        return this.state.dirties[nodeName];
    },
} satisfies AbilityDefinition;
