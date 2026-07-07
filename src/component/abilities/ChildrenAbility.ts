/**
 * ChildrenAbility 子组件管理能力
 *
 * 提供子组件的增删查改操作，参考 ExtJS 的 Container API
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { ComponentBase } from '../ComponentBase';

export const ChildrenAbility: AbilityDefinition = {
    /**
     * 子组件列表
     */
    children: {
        get(): ComponentBase[] {
            return this.abilityState('ChildrenAbility:list', () => []);
        },
    },

    /**
     * 添加子组件
     *
     * @param child - 子组件实例
     * @param index - 可选的插入位置
     */
    addChild(child: ComponentBase, index?: number): void {
        const list = this.children;
        if (index !== undefined && index >= 0 && index <= list.length) {
            list.splice(index, 0, child);
        } else {
            list.push(child);
        }

        // 设置父引用
        child.parent = this as any;

        // 挂载到 DOM
        if (child.el && this.el) {
            if (index !== undefined && index < this.el.children.length) {
                this.el.insertBefore(child.el, this.el.children[index]);
            } else {
                this.el.appendChild(child.el);
            }
        }
    },

    /**
     * 移除并销毁子组件
     */
    removeChild(child: ComponentBase): void {
        const list = this.children;
        const idx = list.indexOf(child);
        if (idx !== -1) {
            list.splice(idx, 1);
            child.parent = null;
            child.dispose();
            child.unmount();
        }
    },

    /**
     * 在指定子组件前插入
     */
    insertBefore(child: ComponentBase, refChild: ComponentBase): void {
        const list = this.children;
        const refIdx = list.indexOf(refChild);
        if (refIdx !== -1) {
            list.splice(refIdx, 0, child);
            child.parent = this as any;
            if (child.el && refChild.el && this.el) {
                this.el.insertBefore(child.el, refChild.el);
            }
        }
    },

    /**
     * 按 id 获取子组件
     */
    getChild(id: string): ComponentBase | undefined {
        return this.children.find((c: any) => c.id === id);
    },

    /**
     * 按 type 查找第一个匹配的子组件
     */
    queryChild(type: string): ComponentBase | undefined {
        return this.children.find((c: any) => c.type === type);
    },

    /**
     * 按 type 查找所有匹配的子组件
     */
    queryChildren(type: string): ComponentBase[] {
        return this.children.filter((c: any) => c.type === type);
    },

    /**
     * 获取子组件索引
     */
    indexOf(child: ComponentBase): number {
        return this.children.indexOf(child);
    },

    /**
     * 子组件数量
     */
    childCount: {
        get(): number {
            return this.children.length;
        },
    },

    /**
     * 移除所有子组件
     */
    removeAll(): void {
        const list = [...this.children];
        for (const child of list) {
            child.parent = null;
            child.dispose();
            child.unmount();
        }
        this.children.length = 0;
    },

    /**
     * 遍历子组件
     */
    eachChild(fn: (child: ComponentBase, index: number) => void): void {
        this.children.forEach(fn);
    },
};
