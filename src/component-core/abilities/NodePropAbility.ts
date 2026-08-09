// abilities/NodePropAbility.ts

import { AbilityDefinition } from '@/composable';
import { DEFAULT_NODE_PROP_MAP, NodeMetadata } from '../types';

/**
 * 节点属性底层操作
 *
 * 纯函数，不依赖 this
 */
export const NodePropAbility = {
    /**
     * 获取节点属性
     */
    getNodeProp(nodeMap: Record<string, NodeMetadata>, nodeName: string, prop: string): any {
        const node = nodeMap?.[nodeName];
        if (!node) return undefined;

        const el = node.el;
        if (!el) return undefined;

        const def = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return undefined;

        if (def.cssProp) {
            return el.style?.[def.cssProp] ?? '';
        }
        if (def.attr) {
            return el.getAttribute(def.attr);
        }
        return (el as any)[def.domAttr];
    },

    /**
     * 设置节点属性
     */
    setNodeProp(
        nodeMap: Record<string, NodeMetadata>,
        nodeName: string,
        prop: string,
        value: any
    ): void {
        const node = nodeMap?.[nodeName];
        if (!node) return;

        const el = node.el;
        if (!el) return;

        const def = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return;

        applyPropToEl(el, def, value);
    },

    /**
     * 批量设置节点属性
     */
    updateNode(
        nodeMap: Record<string, NodeMetadata>,
        nodeName: string,
        props: Record<string, any>
    ): void {
        const node = nodeMap?.[nodeName];
        if (!node) return;

        const el = node.el;
        if (!el) return;

        applyNodeProps(el, props);
    },
} as AbilityDefinition;
