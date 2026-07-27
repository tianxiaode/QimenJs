/**
 * ChildSlotAbility — 子组件插槽能力
 *
 * 提供运行时子组件替换操作。
 * 通过 NodeMapManager.replace() 自动处理销毁旧组件 → 创建新组件 → DOM 原位替换 → nodeMap 合并。
 *
 * 按需组合：只有需要动态替换子组件的场景才引入此能力。
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const ChildSlotAbility = {
    /**
     * 替换指定位置的子组件
     *
     * 通过 NodeMapManager.replace() 自动处理：
     * - 销毁旧组件
     * - DOM 原位替换
     * - nodeMap 合并/清理
     *
     * @param name - 节点名
     * @param newComponentClass - 新的组件类
     * @param props - 传给新组件的 props
     * @returns 新组件实例，或 null 如果节点未找到
     */
    _replaceChildComponent(
        name: string,
        newComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>
    ): any | null {
        const result = this.nodeMapMgr.replace(name, newComponentClass, props);
        this.nodeMap = this.nodeMapMgr.getAll();
        return result;
    },
} satisfies AbilityDefinition;
