// abilities/NodeClassAbility.ts

import { AbilityDefinition } from '@/composable';
import { NodeMetadata } from '../types';

/**
 * 节点类名操作
 *
 * 纯函数，不依赖 this
 */
export const NodeClassAbility = {
    /**
     * 添加类名
     */
    addCls(nodeMap: Record<string, NodeMetadata>, nodeName: string, ...classes: string[]): void {
        const node = nodeMap?.[nodeName];
        if (!node?.el) return;

        const clsList = classes.flatMap(c => c.split(/\s+/)).filter(Boolean);
        if (clsList.length) {
            node.el.classList.add(...clsList);
        }
    },

    /**
     * 移除类名
     */
    removeCls(nodeMap: Record<string, NodeMetadata>, nodeName: string, ...classes: string[]): void {
        const node = nodeMap?.[nodeName];
        if (!node?.el) return;

        const clsList = classes.flatMap(c => c.split(/\s+/)).filter(Boolean);
        if (clsList.length) {
            node.el.classList.remove(...clsList);
        }
    },

    /**
     * 切换类名
     */
    toggleCls(
        nodeMap: Record<string, NodeMetadata>,
        nodeName: string,
        cls: string,
        force?: boolean
    ): void {
        const node = nodeMap?.[nodeName];
        if (!node?.el) return;

        node.el.classList.toggle(cls, force);
    },

    /**
     * 检查类名
     */
    containsCls(nodeMap: Record<string, NodeMetadata>, nodeName: string, cls: string): boolean {
        const node = nodeMap?.[nodeName];
        if (!node?.el) return false;

        return node.el.classList.contains(cls);
    },

    /**
     * 替换类名
     */
    replaceCls(
        nodeMap: Record<string, NodeMetadata>,
        nodeName: string,
        oldCls: string,
        newCls: string
    ): void {
        const node = nodeMap?.[nodeName];
        if (!node?.el) return;

        node.el.classList.replace(oldCls, newCls);
    },
} as AbilityDefinition;
