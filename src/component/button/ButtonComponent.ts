/**
 * ButtonComponent 按钮组件
 *
 * 独立组件，使用 withTemplate 模板创建。
 * 支持类型、尺寸、禁用状态等配置。
 *
 * abilities: [ContentAbility]
 * 使用 ContentAbility 管理按钮文本内容位
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix } from '@qimenjs/component-abilities';
import { BUTTON_TEMPLATE } from '@qimenjs/component-core';

const ButtonBase = ComponentBase.withTemplate(BUTTON_TEMPLATE);

export class ButtonComponent extends ButtonBase {
    static readonly abilities = [ContentAbility];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['default'],
    };

    /** 按钮类型 */
    private _type: string = 'default';

    /** 按钮尺寸 */
    private _size: string = 'medium';

    /** 是否禁用 */
    private _disabled: boolean = false;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-button');

        // 按钮类型
        if (props?.type) this._type = props.type;
        this.applyType();

        // 按钮尺寸
        if (props?.size) this._size = props.size;
        this.applySize();

        // 禁用状态
        if (props?.disabled) this._disabled = true;
        this.applyDisabled();

        // 初始文本
        if (props?.text !== undefined) {
            this.setText(props.text);
        }
    }

    /** 设置按钮文本 */
    setText(text: string | number): void {
        this.default = String(text);
    }

    /** 设置禁用状态 */
    setDisabled(disabled: boolean): void {
        this._disabled = disabled;
        this.applyDisabled();
    }

    /** 应用按钮类型 CSS */
    private applyType(): void {
        this.el.classList.remove(
            'q-button--default',
            'q-button--primary',
            'q-button--success',
            'q-button--warning',
            'q-button--danger',
        );
        this.el.classList.add(`q-button--${this._type}`);
    }

    /** 应用按钮尺寸 CSS */
    private applySize(): void {
        this.el.classList.remove(
            'q-button--small',
            'q-button--medium',
            'q-button--large',
        );
        this.el.classList.add(`q-button--${this._size}`);
    }

    /** 应用禁用状态 CSS */
    private applyDisabled(): void {
        if (this._disabled) {
            this.el.classList.add('q-button--disabled');
            this.el.setAttribute('disabled', '');
        } else {
            this.el.classList.remove('q-button--disabled');
            this.el.removeAttribute('disabled');
        }
    }
}
