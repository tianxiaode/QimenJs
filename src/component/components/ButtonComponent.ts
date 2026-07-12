/**
 * ButtonComponent 按钮组件
 *
 * abilities: [ContentAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility]
 * 使用 ContentAbility 管理图标和文本内容位，支持 iconPosition 切换布局方向
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix } from '@qimenjs/component-abilities';
import { ClickAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { LoadingAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';
import { BUTTON_TEMPLATE } from '@qimenjs/component-core';

const ButtonBase = ComponentBase.withTemplate(BUTTON_TEMPLATE);

export class ButtonComponent extends ButtonBase {
    static readonly abilities = [ContentAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility];

    static readonly contentSlots = {
        [ContentPrefix.ICON]: ['default'],
        [ContentPrefix.TEXT]: ['default'],
    };

    /** 根元素标签：button 而非默认的 div */
    static readonly elTag = 'button';

    /** 图标位置 */
    private _iconPosition: string = 'left';

    constructor(props?: Record<string, any>) {
        super(props);

        // 设置 button 专属属性
        (this.el as HTMLButtonElement).type = 'button';
        this.el.classList.add('q-button');

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

    update(props?: Record<string, any>): void {
        if (props?.iconPosition !== undefined) {
            this._iconPosition = props.iconPosition;
            this.applyIconPosition();
        }
    }
}
