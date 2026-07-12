/**
 * SeparatorComponent 分隔符组件
 *
 * 工具栏/菜单中的视觉分隔线，支持水平和垂直方向。
 *
 * abilities: [VisibleAbility]
 *
 * @example
 * ```js
 * { type: ComponentTypes.SEPARATOR }           // 水平分隔（工具栏中）
 * { type: ComponentTypes.SEPARATOR, vertical: true }  // 垂直分隔（菜单中）
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { VisibleAbility } from '@qimenjs/component-abilities';

export class SeparatorComponent extends TemplateComponent {
    static readonly abilities = [VisibleAbility];

    /** 是否垂直方向 */
    private _vertical: boolean = false;

    constructor(props?: Record<string, any>) {
        super(props);

        if (props?.vertical) {
            this._vertical = true;
            this.el.classList.add('q-separator', 'q-separator--vertical');
            this.el.setAttribute('role', 'separator');
            this.el.setAttribute('aria-orientation', 'vertical');
        } else {
            this.el.classList.add('q-separator', 'q-separator--horizontal');
            this.el.setAttribute('role', 'separator');
            this.el.setAttribute('aria-orientation', 'horizontal');
        }
    }

    /** vertical getter */
    get vertical(): boolean {
        return this._vertical;
    }
}
