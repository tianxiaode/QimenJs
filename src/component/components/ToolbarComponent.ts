/**
 * ToolbarComponent 工具栏组件
 *
 * 支持位置排序、方向切换、折叠的工具栏容器。
 * 通过能力注入获得各种功能：
 * - ToolbarAbility: 位置排序、外观声明、折叠切换
 * - LayoutAbility: 间距、对齐
 * - ChildrenAbility: 子组件管理
 *
 * 业务能力（PaginationAbility、CrudAbility、SearchAbility）
 * 需通过 meta.abilities 按需注入。
 *
 * @example
 * ```js
 * // 横向工具栏（默认）
 * { type: ComponentTypes.TOOLBAR }
 *
 * // 竖向工具栏
 * { type: ComponentTypes.TOOLBAR, direction: 'vertical' }
 *
 * // 竖向工具栏（折叠模式）
 * { type: ComponentTypes.TOOLBAR, direction: 'vertical', collapsed: true }
 *
 * // 带分页的工具栏（通过 meta 注入）
 * { type: ComponentTypes.TOOLBAR,
 *   meta: { abilities: [PaginationAbility] },
 *   currentPage: 1, totalPages: 10, totalRecords: 95 }
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { LayoutAbility } from '@qimenjs/component-abilities';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';
import { ToolbarAbility } from '@qimenjs/component-abilities';

export class ToolbarComponent extends ComponentBase {
    static override readonly abilities = [
        LayoutAbility, ChildrenAbility, AnimationAbility, ToolbarAbility,
    ];

    private _direction: string = 'horizontal';

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-flex');

        if (props?.direction) this._direction = props.direction;
        this.applyDirection();
    }

    /** 布局方向：horizontal（横向）或 vertical（竖向） */
    get direction(): string { return this._direction; }
    set direction(value: string) {
        this._direction = value;
        this.applyDirection();
    }

    private applyDirection(): void {
        this.el.classList.remove('q-flex-row', 'q-flex-col');
        this.el.classList.add(this._direction === 'vertical' ? 'q-flex-col' : 'q-flex-row');
    }

    override update(props?: Record<string, any>): void {
        if (props?.direction !== undefined) {
            this._direction = props.direction;
            this.applyDirection();
        }
    }
}
