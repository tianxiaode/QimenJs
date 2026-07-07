/**
 * ButtonComponent 按钮组件
 *
 * abilities: [IconAbility, TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility]
 * 使用 IconAbility + TextAbility 管理图标和文本，支持 iconPosition 切换布局方向
 */

import { ComponentBase } from '@qimenjs/component-core';
import { IconAbility } from '@qimenjs/component-abilities';
import { TextAbility } from '@qimenjs/component-abilities';
import { ClickAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { LoadingAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';

export class ButtonComponent extends ComponentBase {
    static override readonly abilities = [IconAbility, TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility];
    static override readonly icons = ['default'];
    static override readonly texts = ['default'];
    static override readonly iconItemClass = 'q-button__icon';
    static override readonly textItemClass = 'q-button__text';

    /** 图标位置 */
    private _iconPosition: string = 'left';

    constructor(props?: Record<string, any>) {
        super(props);

        // 创建 DOM 元素
        this.el = document.createElement('button');
        this.el.className = 'q-button';
        (this.el as HTMLButtonElement).type = 'button';

        // 图标位置
        if (props?.iconPosition) this._iconPosition = props.iconPosition;
        this.applyIconPosition();
    }

    /** iconPosition getter/setter */
    get iconPosition(): string {
        return this._iconPosition;
    }
    set iconPosition(value: string) {
        this._iconPosition = value;
        this.applyIconPosition();
    }

    /** 应用图标位置 CSS */
    private applyIconPosition(): void {
        this.el.classList.remove(
            'q-button--icon-left',
            'q-button--icon-right',
            'q-button--icon-top',
            'q-button--icon-bottom',
        );
        this.el.classList.add(`q-button--icon-${this._iconPosition}`);
    }

    override update(props?: Record<string, any>): void {
        if (props?.iconPosition !== undefined) {
            this._iconPosition = props.iconPosition;
            this.applyIconPosition();
        }
    }
}
