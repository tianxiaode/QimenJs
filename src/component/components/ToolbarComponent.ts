/**
 * ToolbarComponent 工具栏组件
 *
 * 支持位置排序的工具栏容器。通过能力注入获得各种功能：
 * - ToolbarAbility: 位置排序、按位置插入/移除/显隐
 * - PaginationAbility: 分页按钮组
 * - CrudAbility: CRUD 操作按钮组
 *
 * @example
 * ```js
 * // 基本工具栏
 * { type: 'Toolbar', gap: 'sm' }
 *
 * // 带分页的工具栏
 * { type: 'Toolbar', gap: 'sm',
 *   currentPage: 1, totalPages: 10, totalRecords: 95 }
 *
 * // 带 CRUD 的工具栏
 * { type: 'Toolbar', gap: 'sm',
 *   showCreate: true, showDelete: true, showExport: true }
 *
 * // 完整功能工具栏
 * { type: 'Toolbar', gap: 'sm',
 *   showCreate: true, showDelete: true,
 *   currentPage: 1, totalPages: 10, totalRecords: 95 }
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { LayoutAbility } from '@qimenjs/component-abilities';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';
import { ToolbarAbility } from '@qimenjs/component-abilities';
import { PaginationAbility } from '@qimenjs/component-abilities';
import { CrudAbility } from '@qimenjs/component-abilities';

export class ToolbarComponent extends ComponentBase {
    static override readonly abilities = [
        LayoutAbility, ChildrenAbility, AnimationAbility,
        ToolbarAbility, PaginationAbility, CrudAbility,
    ];

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
}
