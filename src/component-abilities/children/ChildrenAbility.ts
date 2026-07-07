/**
 * ChildrenAbility 子组件管理能力
 *
 * 提供子组件的增删查改操作，参考 ExtJS 的 Container API。
 * 支持事件通知：childadd / childremove / childmove / childrenchange
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { CHILDREN_EVENTS } from '@qimenjs/events';

/**
 * 子组件类型
 *
 * 使用 any 而非 ComponentLike 避免对 component 包的循环依赖。
 * 实际运行时 this 指向 ComponentLike 实例。
 */
type ComponentLike = any;

export const ChildrenAbility: AbilityDefinition = {
    /**
     * 子组件列表
     */
    children: {
        get(): ComponentLike[] {
            return this.abilityState('ChildrenAbility:list', () => []);
        },
    },

    /**
     * 子组件数量
     */
    childCount: {
        get(): number {
            return this.children.length;
        },
    },

    // ============================================
    // 添加
    // ============================================

    /**
     * 添加子组件
     *
     * @param child - 子组件实例
     * @param index - 可选的插入位置
     * @returns 组件自身，支持链式调用
     */
    addChild(child: ComponentLike, index?: number): any {
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

        this.emit?.(CHILDREN_EVENTS.ADD, { child, index });
        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'add', child, index });
        return this;
    },

    /**
     * 批量添加子组件
     *
     * @param children - 子组件数组
     * @param startIndex - 可选的起始插入位置
     * @returns 组件自身，支持链式调用
     */
    addChildren(children: ComponentLike[], startIndex?: number): any {
        let idx = startIndex ?? this.children.length;
        for (const child of children) {
            this.addChild(child, idx);
            idx++;
        }
        return this;
    },

    /**
     * 在指定子组件前插入
     *
     * @param child - 要插入的子组件
     * @param refChild - 参考子组件
     * @returns 组件自身，支持链式调用
     */
    insertBefore(child: ComponentLike, refChild: ComponentLike): any {
        const list = this.children;
        const refIdx = list.indexOf(refChild);
        if (refIdx !== -1) {
            list.splice(refIdx, 0, child);
            child.parent = this as any;
            if (child.el && refChild.el && this.el) {
                this.el.insertBefore(child.el, refChild.el);
            }
            this.emit?.(CHILDREN_EVENTS.ADD, { child, index: refIdx });
            this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'add', child, index: refIdx });
        }
        return this;
    },

    // ============================================
    // 移除
    // ============================================

    /**
     * 移除并销毁子组件
     *
     * @param child - 要移除的子组件
     * @returns 组件自身，支持链式调用
     */
    removeChild(child: ComponentLike): any {
        const list = this.children;
        const idx = list.indexOf(child);
        if (idx !== -1) {
            list.splice(idx, 1);
            child.parent = null;
            child.unmount();
            child.dispose();

            this.emit?.(CHILDREN_EVENTS.REMOVE, { child, index: idx });
            this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'remove', child, index: idx });
        }
        return this;
    },

    /**
     * 按索引移除子组件
     *
     * @param index - 子组件索引
     * @returns 被移除的子组件，或 undefined
     */
    removeChildAt(index: number): ComponentLike | undefined {
        const list = this.children;
        if (index < 0 || index >= list.length) return undefined;

        const child = list[index];
        list.splice(index, 1);
        child.parent = null;
        child.unmount();
        child.dispose();

        this.emit?.(CHILDREN_EVENTS.REMOVE, { child, index });
        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'remove', child, index });
        return child;
    },

    /**
     * 移除所有子组件
     *
     * @returns 组件自身，支持链式调用
     */
    removeAll(): any {
        const list = [...this.children];
        for (const child of list) {
            child.parent = null;
            child.unmount();
            child.dispose();
        }
        this.children.length = 0;

        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'removeall' });
        return this;
    },

    // ============================================
    // 替换与移动
    // ============================================

    /**
     * 替换子组件
     *
     * @param oldChild - 被替换的子组件
     * @param newChild - 新的子组件
     * @returns 组件自身，支持链式调用
     */
    replaceChild(oldChild: ComponentLike, newChild: ComponentLike): any {
        const list = this.children;
        const idx = list.indexOf(oldChild);
        if (idx === -1) return this;

        // 移除旧组件
        list.splice(idx, 1);
        oldChild.parent = null;
        oldChild.unmount();
        oldChild.dispose();

        // 插入新组件
        list.splice(idx, 0, newChild);
        newChild.parent = this as any;
        if (newChild.el && this.el) {
            if (idx < this.el.children.length) {
                this.el.insertBefore(newChild.el, this.el.children[idx]);
            } else {
                this.el.appendChild(newChild.el);
            }
        }

        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'replace', oldChild, newChild, index: idx });
        return this;
    },

    /**
     * 移动子组件到新位置
     *
     * @param child - 要移动的子组件
     * @param newIndex - 新的索引位置
     * @returns 组件自身，支持链式调用
     */
    moveChild(child: ComponentLike, newIndex: number): any {
        const list = this.children;
        const oldIndex = list.indexOf(child);
        if (oldIndex === -1 || oldIndex === newIndex) return this;

        // 从旧位置移除
        list.splice(oldIndex, 1);

        // 插入新位置
        const targetIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
        list.splice(targetIndex, 0, child);

        // 同步 DOM 顺序
        if (child.el && this.el) {
            this.el.removeChild(child.el);
            if (targetIndex < this.el.children.length) {
                this.el.insertBefore(child.el, this.el.children[targetIndex]);
            } else {
                this.el.appendChild(child.el);
            }
        }

        this.emit?.(CHILDREN_EVENTS.MOVE, { child, oldIndex, newIndex: targetIndex });
        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'move', child, oldIndex, newIndex: targetIndex });
        return this;
    },

    // ============================================
    // 查询
    // ============================================

    /**
     * 按索引获取子组件
     *
     * @param index - 索引
     * @returns 子组件，或 undefined
     */
    getChildAt(index: number): ComponentLike | undefined {
        return this.children[index];
    },

    /**
     * 按 id 获取子组件
     *
     * @param id - 组件 id
     * @returns 子组件，或 undefined
     */
    getChild(id: string): ComponentLike | undefined {
        return this.children.find((c: any) => c.id === id);
    },

    /**
     * 按 type 查找第一个匹配的直接子组件
     *
     * @param type - 组件类型
     * @returns 子组件，或 undefined
     */
    queryChild(type: string): ComponentLike | undefined {
        return this.children.find((c: any) => c.type === type);
    },

    /**
     * 按 type 查找所有匹配的直接子组件
     *
     * @param type - 组件类型
     * @returns 子组件数组
     */
    queryChildren(type: string): ComponentLike[] {
        return this.children.filter((c: any) => c.type === type);
    },

    /**
     * 递归深度查找第一个匹配的子组件
     *
     * @param type - 组件类型
     * @returns 子组件，或 undefined
     */
    find(type: string): ComponentLike | undefined {
        for (const child of this.children) {
            if ((child as any).type === type) return child;
            if (typeof (child as any).find === 'function') {
                const found = (child as any).find(type);
                if (found) return found;
            }
        }
        return undefined;
    },

    /**
     * 递归深度查找所有匹配的子组件
     *
     * @param type - 组件类型
     * @returns 子组件数组
     */
    findAll(type: string): ComponentLike[] {
        const result: ComponentLike[] = [];
        for (const child of this.children) {
            if ((child as any).type === type) result.push(child);
            if (typeof (child as any).findAll === 'function') {
                result.push(...(child as any).findAll(type));
            }
        }
        return result;
    },

    /**
     * 获取子组件索引
     *
     * @param child - 子组件
     * @returns 索引，未找到返回 -1
     */
    indexOf(child: ComponentLike): number {
        return this.children.indexOf(child);
    },

    /**
     * 判断是否包含指定子组件（仅直接子组件）
     *
     * @param child - 子组件
     * @returns 是否包含
     */
    contains(child: ComponentLike): boolean {
        return this.children.indexOf(child) !== -1;
    },

    /**
     * 遍历子组件
     *
     * @param fn - 遍历回调，返回 false 可中断
     */
    eachChild(fn: (child: ComponentLike, index: number) => void | boolean): void {
        const list = this.children;
        for (let i = 0; i < list.length; i++) {
            if (fn(list[i], i) === false) break;
        }
    },
};
