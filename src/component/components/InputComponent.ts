/**
 * InputComponent 输入框组件
 *
 * abilities: [ElementEventAbility, ContentAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility]
 * ContentAbility 管理标签/前后缀/错误/提示文本，ValueAbility 管理输入值
 * ElementEventAbility 自动绑定模板中 data-event 声明的事件
 *
 * 事件处理（由 ElementEventAbility 自动绑定）：
 * - onField — input:field 的 input 事件（方法名从 data-content 推导）
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix, ElementEventAbility } from '@qimenjs/component-abilities';
import { ValueAbility } from '@qimenjs/component-abilities';
import { ValidateAbility } from '@qimenjs/component-abilities';
import { PlaceholderAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';
import { INPUT_TEMPLATE } from '@qimenjs/component-core';

const InputBase = TemplateComponent.withTemplate(INPUT_TEMPLATE);

export class InputComponent extends InputBase {
    static readonly abilities = [
        ElementEventAbility, ContentAbility, ValueAbility, ValidateAbility,
        PlaceholderAbility, DisableAbility, SizeAbility,
    ];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['label', 'prefix', 'suffix', 'error', 'hint'],
    };

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-input');
    }

    /**
     * input:field 的 input 事件处理
     * 由 ElementEventAbility 自动绑定（模板中 data-event="input"）
     * 方法名从 data-content="input:field" 推导：单 group → onField
     */
    onField(_event: Event, el: HTMLInputElement): void {
        this.value = el.value;
    }

    update(props?: Record<string, any>): void {
        const inputEl = this.nodeMap['input']?.['field']?.el as HTMLInputElement | null;
        if (props?.value !== undefined && inputEl) {
            inputEl.value = props.value;
        }
        if (props?.placeholder !== undefined && inputEl) {
            inputEl.placeholder = props.placeholder;
        }
    }
}
