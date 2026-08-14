// abilities/NodeAttrAbility.ts

import { AbilityDefinition } from '@/composable';

/**
 * 节点属性操作（走脏追踪）
 *
 * 所有属性变更都通过 _markNodeDirty 触发脏追踪
 */
export const NodeAttrAbility = {
    /**
     * 设置节点属性（走脏追踪）
     */
    setNodeProp(nodeName: string, prop: string, value: any): void {
        (this as any)._markNodeDirty(nodeName, { [prop]: value });
    },

    /**
     * 批量设置节点属性（走脏追踪）
     */
    updateNode(instance: any, nodeName: string, props: Record<string, any>): void {
        (this as any)._markNodeDirty(nodeName, props);
    },

    /**
     * 设置类名（走脏追踪）
     */
    setNodeCls(instance: any, nodeName: string, value: string): void {
        (this as any)._markNodeDirty(nodeName, { cls: value });
    },

    /**
     * 设置样式（走脏追踪）
     */
    setNodeStyle(instance: any, nodeName: string, value: any): void {
        (this as any)._markNodeDirty(nodeName, { style: value });
    },

    /**
     * 设置隐藏（走脏追踪）
     */
    setNodeHidden(instance: any, nodeName: string, value: boolean): void {
        (this as any)._markNodeDirty(nodeName, { hidden: value });
    },

    /**
     * 设置禁用（走脏追踪）
     */
    setNodeDisabled(instance: any, nodeName: string, value: boolean): void {
        (this as any)._markNodeDirty(nodeName, { disabled: value });
    },

    // ... 其他 setNodeXxx 方法都走 _markNodeDirty
} as AbilityDefinition;
