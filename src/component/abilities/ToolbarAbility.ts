/**
 * ToolbarAbility 工具栏能力
 *
 * 提供位置排序、按位置插入/移除/显隐等操作。
 * 任何组件注入此能力即可获得工具栏行为。
 *
 * @example
 * ```js
 * // 给任意容器加工具栏能力
 * class MyToolbar extends ComponentBase {
 *     static abilities = [LayoutAbility, ChildrenAbility, ToolbarAbility];
 * }
 *
 * // 运行时操作
 * toolbar.insertAt(15, myButton);
 * toolbar.hideAtPosition(20);
 * toolbar.reorder();
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';

/** 位置属性名 */
const POSITION_PROP = 'position';

/** 默认位置增量 */
const POSITION_STEP = 10;

export const ToolbarAbility: AbilityDefinition = {
    /**
     * 按 position 排序后的子组件列表
     */
    sortedChildren: {
        get(): any[] {
            return [...this.children].sort((a: any, b: any) => {
                const pa = a[POSITION_PROP] ?? Infinity;
                const pb = b[POSITION_PROP] ?? Infinity;
                return pa - pb;
            });
        },
    },

    /**
     * 按 position 重新排序 DOM
     */
    reorder(): any {
        const sorted = this.sortedChildren;
        for (const child of sorted) {
            if (child.el && this.el) {
                this.el.appendChild(child.el);
            }
        }
        this.emit?.('toolbarreorder', { children: sorted });
        return this;
    },

    /**
     * 在指定位置插入组件
     *
     * @param position - 位置值（越小越靠前）
     * @param child - 要插入的组件
     * @returns 组件自身，支持链式调用
     */
    insertAt(position: number, child: any): any {
        child[POSITION_PROP] = position;
        this.addChild(child);

        const sorted = this.sortedChildren;
        const idx = sorted.indexOf(child);

        if (child.el && this.el) {
            this.el.removeChild(child.el);
            if (idx < this.el.children.length) {
                this.el.insertBefore(child.el, this.el.children[idx]);
            } else {
                this.el.appendChild(child.el);
            }
        }

        this.emit?.('toolbarinsert', { child, position });
        return this;
    },

    /**
     * 在指定组件之前插入
     */
    insertBeforeItem(refChild: any, newChild: any): any {
        const refPos = refChild[POSITION_PROP];
        if (refPos !== undefined) {
            const sorted = this.sortedChildren;
            const refIdx = sorted.indexOf(refChild);
            const prevPos = refIdx > 0 ? (sorted[refIdx - 1] as any)[POSITION_PROP] ?? 0 : 0;
            newChild[POSITION_PROP] = Math.floor((prevPos + refPos) / 2);
        }
        this.addChild(newChild);
        this.reorder();
        return this;
    },

    /**
     * 在指定组件之后插入
     */
    insertAfterItem(refChild: any, newChild: any): any {
        const refPos = refChild[POSITION_PROP];
        if (refPos !== undefined) {
            const sorted = this.sortedChildren;
            const refIdx = sorted.indexOf(refChild);
            const nextPos = refIdx < sorted.length - 1
                ? (sorted[refIdx + 1] as any)[POSITION_PROP] ?? refPos + POSITION_STEP * 2
                : refPos + POSITION_STEP * 2;
            newChild[POSITION_PROP] = Math.floor((refPos + nextPos) / 2);
        }
        this.addChild(newChild);
        this.reorder();
        return this;
    },

    /**
     * 按 position 移除组件
     */
    removeAtPosition(position: number): any {
        const child = this.children.find((c: any) => c[POSITION_PROP] === position);
        if (child) this.removeChild(child);
        return child;
    },

    /**
     * 按 position 隐藏组件
     */
    hideAtPosition(position: number): any {
        const child = this.children.find((c: any) => c[POSITION_PROP] === position);
        if (child && typeof child.hide === 'function') child.hide();
        return this;
    },

    /**
     * 按 position 显示组件
     */
    showAtPosition(position: number): any {
        const child = this.children.find((c: any) => c[POSITION_PROP] === position);
        if (child && typeof child.show === 'function') child.show();
        return this;
    },

    /**
     * 按 position 获取组件
     */
    getAtPosition(position: number): any {
        return this.children.find((c: any) => c[POSITION_PROP] === position);
    },
};
