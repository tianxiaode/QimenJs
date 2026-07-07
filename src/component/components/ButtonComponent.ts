/**
 * ButtonComponent 按钮组件
 *
 * abilities: [TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility]
 * 使用 TextAbility 管理文本，支持 setText() 链式调用
 */

import { ComponentBase } from '../ComponentBase';
import { TextAbility } from '../abilities/TextAbility';
import { ClickAbility } from '../abilities/ClickAbility';
import { DisableAbility } from '../abilities/DisableAbility';
import { LoadingAbility } from '../abilities/LoadingAbility';
import { SizeAbility } from '../abilities/SizeAbility';

export class ButtonComponent extends ComponentBase {
    static override readonly abilities = [TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility];

    /** 按钮图标 */
    private _icon: string = '';

    constructor(props?: Record<string, any>) {
        super(props);

        // 创建 DOM 元素
        this.el = document.createElement('button');
        this.el.className = 'q-button';
        (this.el as HTMLButtonElement).type = 'button';

        // 设置初始属性
        if (props?.icon) this._icon = props.icon;

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
        if (props?.icon !== undefined) this._icon = props.icon;
        this.renderContent();
    }

    private renderContent(): void {
        if (!this.el) return;
        let html = '';
        if (this._icon) {
            html += `<span class="q-button__icon">${this._icon}</span>`;
        }
        // TextAbility 管理的文本通过 data-ref="text" 容器渲染
        html += `<span class="q-button__text" data-ref="text">${this.text || ''}</span>`;
        this.el.innerHTML = html;
    }
}
