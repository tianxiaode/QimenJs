/**
 * SeparatorComponent 分隔符组件
 *
 * 工具栏/菜单中的视觉分隔线，支持水平和垂直方向。
 *
 * abilities: [VisibleAbility]
 *
 * @example
 * ```js
 * { type: 'Separator' }           // 水平分隔（工具栏中）
 * { type: 'Separator', vertical: true }  // 垂直分隔（菜单中）
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { VisibleAbility } from '@qimenjs/component-abilities';

export class SeparatorComponent extends ComponentBase {
    static override readonly abilities = [VisibleAbility];

    /** 是否垂直方向 */
    private _vertical: boolean = false;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');

        if (props?.vertical) {
            this._vertical = true;
            this.el.className = 'q-separator q-separator--vertical';
            this.el.setAttribute('role', 'separator');
            this.el.setAttribute('aria-orientation', 'vertical');
        } else {
            this.el.className = 'q-separator q-separator--horizontal';
            this.el.setAttribute('role', 'separator');
            this.el.setAttribute('aria-orientation', 'horizontal');
        }
    }

    /** vertical getter */
    get vertical(): boolean {
        return this._vertical;
    }
}
