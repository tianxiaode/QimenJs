import { AbilityDefinition } from '@/composable';

/**
 * 节点属性底层操作
 *
 * 纯函数，不依赖 this
 */
export const NodePropAbility = {
    /**
     * 设置节点属性
     */
    setNodeProp(name: string, prop: string, value: any): void {
        this.nodeAttrMgr.setProp(name, prop, value);
    },

    setupNodeProps(name: string, props: Record<string, any>): void {
        this.nodeAttrManager.setProps(name, props);
    },

    /**
     * 获取节点属性
     */
    getNodeProp(name: string, prop: string): any {
        return this.nodeAttrMgr.getProp(name, prop);
    },
} as AbilityDefinition;
