/**
 * ChildSlotAbility — 子组件插槽能力
 *
 * 提供 nodeMap 中子组件的替换操作。
 * 利用 NodeMetadata 中记录的 parentNode/nodeIndex 定位 DOM 位置，
 * 销毁旧组件后在原位挂载新组件。
 *
 * 按需组合：只有需要动态替换子组件的场景才引入此能力。
 * 基础的子组件渲染和销毁由 TemplateAbility 处理。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { NodeMetadata } from '@qimenjs/component-core';

export const ChildSlotAbility: AbilityDefinition = {
    /**
     * 替换指定位置的子组件
     *
     * 利用 nodeMap 中记录的 parentNode/nodeIndex 定位 DOM 位置，
     * 销毁旧组件，在原位挂载新组件。
     *
     * @param name - 节点名（data-content 的 name 部分）
     * @param newComponentClass - 新的组件类
     * @param props - 传给新组件的 props
     * @returns 新组件实例，或 null 如果节点未找到
     */
    _replaceChildComponent(
        name: string,
        newComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>,
    ): any | null {
        // 在 nodeMap 中查找目标节点
        const node: NodeMetadata | undefined = this.nodeMap[name];

        if (!node) {
            console.warn(`ChildSlotAbility._replaceChildComponent: node "${name}" not found in nodeMap`);
            return null;
        }

        // 销毁旧组件（不通过 onCleanup，直接 dispose）
        if (node.component && typeof node.component.dispose === 'function') {
            node.component.dispose();
        }

        // 创建新组件实例
        const newChild = new newComponentClass(props);
        (newChild as any).parent = this;

        // 替换 DOM
        if (node.parentNode && node.nodeIndex !== undefined) {
            // replace 模式：利用 parentNode + nodeIndex 在原位插入
            const referenceNode = node.parentNode.childNodes[node.nodeIndex];
            if (referenceNode) {
                node.parentNode.insertBefore(newChild.el, referenceNode);
            } else {
                node.parentNode.appendChild(newChild.el);
            }
            // replace 模式下更新 el 引用（新组件 el 替换了旧 el）
            node.el = newChild.el;
        } else if (node.jsonMode === 'child') {
            // child 模式：清空占位节点内容，挂载新组件
            const container = node.el.parentElement;
            if (container) {
                container.innerHTML = '';
                container.appendChild(newChild.el);
            }
        } else {
            // 默认：清空容器节点内容，挂载新组件到内部
            // node.el 保持为容器 div，不更新为子组件 el
            node.el.innerHTML = '';
            node.el.appendChild(newChild.el);
        }

        // 更新 nodeMap
        node.component = newChild;
        node.componentClass = newComponentClass;

        return newChild;
    },
};
