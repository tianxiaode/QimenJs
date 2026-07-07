/**
 * ToolbarComponent 工具栏组件
 *
 * 支持位置排序的工具栏容器。每个子项可通过 position 值控制渲染顺序。
 * 提供按位置插入、移除、重排等操作。
 *
 * abilities: [LayoutAbility, ChildrenAbility, AnimationAbility]
 *
 * @example
 * ```js
 * // 基本用法
 * { type: 'Toolbar', gap: 'sm',
 *   items: [
 *     { type: 'Button', text: '新建', position: 10 },
 *     { type: 'Button', text: '保存', position: 20 },
 *     { type: 'Separator', position: 25 },
 *     { type: 'Button', text: '删除', position: 30 },
 *   ]
 * }
 *
 * // 运行时操作
 * toolbar.insertAt(15, myButton);   // 在 10 和 20 之间插入
 * toolbar.removeItem(myButton);     // 移除
 * toolbar.reorder();                // 重新排序 DOM
 * ```
 */

import { ComponentBase } from '../ComponentBase';
import { LayoutAbility } from '../abilities/LayoutAbility';
import { ChildrenAbility } from '../abilities/ChildrenAbility';
import { AnimationAbility } from '../abilities/AnimationAbility';
import type { ComponentBase as CB } from '../ComponentBase';

/** 工具栏项的位置属性名 */
const POSITION_PROP = 'position';

/** 默认位置增量 */
const POSITION_STEP = 10;

export class ToolbarComponent extends ComponentBase {
    static override readonly abilities = [LayoutAbility, ChildrenAbility, AnimationAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-toolbar q-flex q-flex-row';
        this.el.setAttribute('role', 'toolbar');

        // 应用布局属性
        if (props?.gap) this.el.classList.add(`q-gap-${props.gap}`);
        if (props?.align) this.el.classList.add(`q-items-${props.align}`);
        if (props?.justify) this.el.classList.add(`q-justify-${props.justify}`);
    }

    // ============================================
    // 位置排序
    // ============================================

    /**
     * 按 position 排序后的子组件列表
     *
     * position 值小的排在前面，没有 position 的排在最后
     */
    get sortedChildren(): CB[] {
        return [...this.children].sort((a: any, b: any) => {
            const pa = (a as any)[POSITION_PROP] ?? Infinity;
            const pb = (b as any)[POSITION_PROP] ?? Infinity;
            return pa - pb;
        });
    }

    /**
     * 按 position 重新排序 DOM
     *
     * 将子组件的 DOM 元素按 position 顺序重新插入
     */
    reorder(): void {
        const sorted = this.sortedChildren;
        for (const child of sorted) {
            if (child.el && this.el) {
                this.el.appendChild(child.el);
            }
        }
        this.emit?.('toolbarreorder', { children: sorted });
    }

    // ============================================
    // 位置插入
    // ============================================

    /**
     * 在指定位置插入组件
     *
     * 组件会被赋予 position 值，并插入到正确的排序位置。
     * 如果 position 与已有项冲突，会自动微调已有项的位置。
     *
     * @param position - 位置值（越小越靠前）
     * @param child - 要插入的组件
     * @returns 组件自身，支持链式调用
     */
    insertAt(position: number, child: CB): any {
        // 设置 position 属性
        (child as any)[POSITION_PROP] = position;

        // 添加到子组件列表
        this.addChild(child);

        // 按 position 排序确定实际索引
        const sorted = this.sortedChildren;
        const idx = sorted.indexOf(child);

        // 移动 DOM 到正确位置
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
    }

    /**
     * 在指定组件之前插入
     *
     * @param refChild - 参考组件
     * @param newChild - 要插入的组件
     * @returns 组件自身，支持链式调用
     */
    insertBefore(refChild: CB, newChild: CB): any {
        const refPos = (refChild as any)[POSITION_PROP];
        if (refPos !== undefined) {
            // 找到 refChild 前一个项的 position
            const sorted = this.sortedChildren;
            const refIdx = sorted.indexOf(refChild);
            const prevPos = refIdx > 0 ? (sorted[refIdx - 1] as any)[POSITION_PROP] ?? 0 : 0;
            (newChild as any)[POSITION_PROP] = Math.floor((prevPos + refPos) / 2);
        }

        this.addChild(newChild);
        this.reorder();
        return this;
    }

    /**
     * 在指定组件之后插入
     *
     * @param refChild - 参考组件
     * @param newChild - 要插入的组件
     * @returns 组件自身，支持链式调用
     */
    insertAfter(refChild: CB, newChild: CB): any {
        const refPos = (refChild as any)[POSITION_PROP];
        if (refPos !== undefined) {
            const sorted = this.sortedChildren;
            const refIdx = sorted.indexOf(refChild);
            const nextPos = refIdx < sorted.length - 1 ? (sorted[refIdx + 1] as any)[POSITION_PROP] ?? refPos + POSITION_STEP * 2 : refPos + POSITION_STEP * 2;
            (newChild as any)[POSITION_PROP] = Math.floor((refPos + nextPos) / 2);
        }

        this.addChild(newChild);
        this.reorder();
        return this;
    }

    // ============================================
    // 移除与显隐
    // ============================================

    /**
     * 按 position 移除组件
     *
     * @param position - 位置值
     * @returns 被移除的组件，或 undefined
     */
    removeAtPosition(position: number): CB | undefined {
        const child = this.children.find((c: any) => (c as any)[POSITION_PROP] === position);
        if (child) {
            this.removeChild(child);
        }
        return child;
    }

    /**
     * 按 position 隐藏组件
     *
     * @param position - 位置值
     * @returns 组件自身，支持链式调用
     */
    hideAtPosition(position: number): any {
        const child = this.children.find((c: any) => (c as any)[POSITION_PROP] === position);
        if (child && typeof (child as any).hide === 'function') {
            (child as any).hide();
        }
        return this;
    }

    /**
     * 按 position 显示组件
     *
     * @param position - 位置值
     * @returns 组件自身，支持链式调用
     */
    showAtPosition(position: number): any {
        const child = this.children.find((c: any) => (c as any)[POSITION_PROP] === position);
        if (child && typeof (child as any).show === 'function') {
            (child as any).show();
        }
        return this;
    }

    /**
     * 按 position 获取组件
     *
     * @param position - 位置值
     * @returns 组件，或 undefined
     */
    getAtPosition(position: number): CB | undefined {
        return this.children.find((c: any) => (c as any)[POSITION_PROP] === position);
    }
}
