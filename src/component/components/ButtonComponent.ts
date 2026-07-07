/**
 * ButtonComponent 按钮组件
 *
 * abilities: [ClickAbility, DisableAbility, LoadingAbility, SizeAbility]
 */

import { ComponentBase } from '../ComponentBase';
import { ClickAbility } from '../abilities/ClickAbility';
import { DisableAbility } from '../abilities/DisableAbility';
import { LoadingAbility } from '../abilities/LoadingAbility';
import { SizeAbility } from '../abilities/SizeAbility';

export class ButtonComponent extends ComponentBase {
    static override readonly abilities = [ClickAbility, DisableAbility, LoadingAbility, SizeAbility];

    /** 按钮文本 */
    private _text: string = '';

    /** 按钮图标 */
    private _icon: string = '';

    constructor(props?: Record<string, any>) {
        super(props);

        // 创建 DOM 元素
        this.el = document.createElement('button');
        this.el.className = 'q-button';
        (this.el as HTMLButtonElement).type = 'button';

        // 设置初始属性
        if (props?.text) this._text = props.text;
        if (props?.icon) this._icon = props.icon;

        this.renderContent();
    }

    /** text getter/setter */
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        this._text = value;
        this.renderContent();
    }

    /** icon getter/setter */
    get icon(): string {
        return this._icon;
    }
    set icon(value: string) {
        this._icon = value;
        this.renderContent();
    }

    override update(props?: Record<string, any>): void {
        if (props?.text !== undefined) this._text = props.text;
        if (props?.icon !== undefined) this._icon = props.icon;
        this.renderContent();
    }

    private renderContent(): void {
        if (!this.el) return;
        let html = '';
        if (this._icon) {
            html += `<span class="q-button__icon">${this._icon}</span>`;
        }
        html += `<span class="q-button__text">${this._text}</span>`;
        this.el.innerHTML = html;
    }
}
