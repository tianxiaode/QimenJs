// abilities/NodeAttrAbility.ts

import { AbilityDefinition } from '@/composable';
import { AttributesMap } from '../types';

/**
 * 节点属性操作（走脏追踪）
 *
 * 所有属性变更都通过 _markNodeDirty 触发脏追踪
 */
export const AttributeAbility: AbilityDefinition = {
    getAttribute(nodeName: string, attributeName: string): any {
        return this.attributeManager.getAttribute(nodeName, attributeName);
    },

    setAttribute(nodeName: string, attributeName: string, value: any): void {
        this.attributeManager.setAttribute(nodeName, attributeName, value);
    },

    setAttributes(nodeName: string, attributes: Partial<AttributesMap>): void {
        this.attributeManager.setAttributes(nodeName, attributes);
    },

    removeAttribute(nodeName: string, attribute: string): void {
        this.attributeManager.removeAttribute(nodeName, attribute);
    },

    removeAttributes(nodeName: string, attributes: string[]): void {
        this.attributeManager.removeAttributes(nodeName, attributes);
    },

    getCls(nodeName: string): DOMTokenList {
        return this.attributeManager.getCls(nodeName);
    },

    hasCls(nodeName: string, cls: string): boolean {
        return this.attributeManager.hasCls(nodeName, cls);
    },

    addCls(nodeName: string, cls: string): void {
        this.attributeManager.addCls(nodeName, cls);
    },

    removeCls(nodeName: string, cls: string): void {
        this.attributeManager.removeCls(nodeName, cls);
    },

    toggleCls(nodeName: string, cls: string): void {
        this.attributeManager.toggleCls(nodeName, cls);
    },

    flushAttributes(nodeName?: string): void {
        this.attributeManager.flush(nodeName);
    },
} satisfies AbilityDefinition;
