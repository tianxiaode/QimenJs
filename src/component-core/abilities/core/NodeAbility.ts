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
import { IComponentCore, NodeMeta } from '../../types';

/** 节点查询与解析能力，提供 nodeMap 只读访问、节点目标解析与 DOM 包含判定 */
export const NodeAbility: AbilityDefinition = {
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
        if (!index || index.length === 0) return undefined;
        el = this._findByPath(index);
        this._setNodeEl(nodeName, el); // 缓存 DOM 元素
        return el;
    },

    _setNodeEl(nodeName: string, el: HTMLElement): void {
        this.nodeElements[nodeName] = el;
    },

    getComponent(nodeName: string): IComponentCore {
        return this.nodeInstances[nodeName];
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
        return this._tplCache.childComponents || [];
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

    /**
     * 运行时动态替换指定节点的子组件
     *
     * 销毁旧组件及其子条目 → 创建新组件实例 → DOM 原位替换 → 合并 nodeMap。
     * 与模板编译期的 Component.replace() 不同，这是运行时操作。
     *
     * @param nodeName - 目标节点名称
     * @param ComponentClass - 新的组件类构造函数
     * @param options - 传递给新组件的属性对象，可选
     * @returns 新创建的组件实例，如果节点未找到则返回 null
     *
     * @example
     * ```typescript
     * // 替换为新的组件实例
     * const newHeader = manager.replace('header', HeaderComponent, { title: 'New Title' });
     *
     * // 不带 props 的替换
     * const newFooter = manager.replace('footer', FooterComponent);
     *
     * // 检查是否成功
     * if (!newHeader) {
     *   console.error('Header node not found');
     * }
     * ```
     *
     * @remarks
     * - 会先销毁旧组件及其所有子节点
     * - 新组件的 parent 会自动设置为当前管理器的 owner
     * - 会合并新组件的 nodeMap 到父组件
     * - 如果节点不存在，返回 null
     */
    replace(nodeName: string, componentClass: any, options?: Record<string, any>): any | null {
        const old = this.getNodeEl(nodeName);
        if (!old) return null;

        const newChild = new componentClass(options);

        old?.replaceWith(newChild.el!);
        this._setNodeEl(nodeName, newChild.el);
        this._setComponent(nodeName, newChild);

        return newChild;
    },
} satisfies AbilityDefinition;
