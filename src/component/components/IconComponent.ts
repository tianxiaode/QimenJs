/**
 * IconComponent 图标组件
 *
 * 纯图标组件，用于在 JSON 定义中通过 type: "Icon" 直接使用。
 * 内部直接管理 DOM，不使用 ContentAbility（图标组件无复杂交互逻辑，无需能力层）。
 *
 * @example
 * ```js
 * // JSON 定义
 * { type: 'Icon', icon: 'home', size: 'lg' }
 *
 * // TypeScript API
 * const icon = new IconComponent({ icon: 'home', size: 'lg' });
 * icon.icon = 'settings';
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

export class IconComponent extends ComponentBase {
    static override readonly abilities = [SizeAbility];

    /** 根元素标签：span 而非默认的 div */
    static override readonly elTag = 'span';

    private _iconEl: HTMLElement;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-icon');

        this._iconEl = document.createElement('span');
        this._iconEl.className = 'q-icon__content';
        this.el.appendChild(this._iconEl);

        if (props?.icon) this._iconEl.innerHTML = props.icon;
    }

    /** 图标内容（HTML 字符串） */
    get icon(): string { return this._iconEl.innerHTML; }
    set icon(value: string) { this._iconEl.innerHTML = value; }

    override update(props?: Record<string, any>): void {
        if (props?.icon !== undefined) this.icon = props.icon;
    }
}
