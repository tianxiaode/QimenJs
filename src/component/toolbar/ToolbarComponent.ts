/**
 * ToolbarComponent 工具栏组件
 *
 * 支持方向切换、溢出处理的工具栏容器。
 * 通过能力注入获得各种功能：
 * - OverflowScrollAbility: 溢出时箭头滚动 + 滑动滚动
 * - OverflowMenuAbility: 溢出时下拉菜单（与 OverflowScrollAbility 互斥）
 *
 * 溢出模式（overflowMode）：
 * - 'scroll': 子项超出时显示左/右（或上/下）箭头，支持拖拽滑动
 * - 'menu': 子项超出时在最右/下显示下拉箭头，弹出菜单显示溢出项
 * - 'none': 不处理溢出（默认）
 *
 * @example
 * ```js
 * // 横向工具栏（默认）
 * { type: ComponentTypes.TOOLBAR }
 *
 * // 竖向工具栏
 * { type: ComponentTypes.TOOLBAR, direction: 'vertical' }
 *
 * // 横向工具栏 + 溢出滚动
 * { type: ComponentTypes.TOOLBAR, overflowMode: 'scroll' }
 *
 * // 竖向工具栏 + 溢出菜单
 * { type: ComponentTypes.TOOLBAR, direction: 'vertical', overflowMode: 'menu' }
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { TOOLBAR_TEMPLATE } from '@qimenjs/component-core';
import { OverflowScrollAbility, OverflowMenuAbility } from '@qimenjs/component-abilities';
import type { OverflowDirection } from '@qimenjs/component-abilities';

/** 溢出模式 */
export type OverflowMode = 'none' | 'scroll' | 'menu';

const ToolbarBase = TemplateComponent.withTemplate(TOOLBAR_TEMPLATE);

export class ToolbarComponent extends ToolbarBase {
    static readonly abilities = [OverflowScrollAbility, OverflowMenuAbility];

    private _direction: string = 'horizontal';
    private _overflowMode: OverflowMode = 'none';

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-toolbar');

        // 动态注入溢出能力
        this.setupAbilities([OverflowScrollAbility, OverflowMenuAbility]);

        if (props?.direction) this._direction = props.direction;
        this.applyDirection();

        if (props?.overflowMode) this._overflowMode = props.overflowMode;
        this.applyOverflowMode();
    }

    /** 布局方向：horizontal（横向）或 vertical（竖向） */
    get direction(): string { return this._direction; }
    set direction(value: string) {
        this._direction = value;
        this.applyDirection();
    }

    /** 溢出模式：none / scroll / menu */
    get overflowMode(): OverflowMode { return this._overflowMode; }
    set overflowMode(value: OverflowMode) {
        this._overflowMode = value;
        this.applyOverflowMode();
    }

    private applyDirection(): void {
        this.el.classList.remove('q-toolbar--horizontal', 'q-toolbar--vertical');
        this.el.classList.add(`q-toolbar--${this._direction}`);
    }

    private applyOverflowMode(): void {
        const direction = this._direction as OverflowDirection;

        switch (this._overflowMode) {
            case 'scroll':
                this.initOverflowScroll({ direction });
                break;
            case 'menu':
                this.initOverflowMenu({ direction });
                break;
            case 'none':
            default:
                break;
        }
    }

    update(props?: Record<string, any>): void {
        if (props?.direction !== undefined) {
            this._direction = props.direction;
            this.applyDirection();
        }
        if (props?.overflowMode !== undefined) {
            this._overflowMode = props.overflowMode;
            this.applyOverflowMode();
        }
    }
}
