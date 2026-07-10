/**
 * InputComponent 输入框组件
 *
 * abilities: [ContentAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility]
 * ContentAbility 管理标签/前后缀/错误/提示文本，ValueAbility 管理输入值
 *
 * 文本内容位（由 ContentAbility 通过 data-content 查找并管理）：
 * - label — 标签文本
 * - prefix — 前缀文本（货币符号等）
 * - suffix — 后缀文本（单位等）
 * - error — 错误提示
 * - hint — 提示文本
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix } from '@qimenjs/component-abilities';
import { ValueAbility } from '@qimenjs/component-abilities';
import { ValidateAbility } from '@qimenjs/component-abilities';
import { PlaceholderAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';

export class InputComponent extends ComponentBase {
    static readonly abilities = [
        ContentAbility, ValueAbility, ValidateAbility,
        PlaceholderAbility, DisableAbility, SizeAbility,
    ];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['label', 'prefix', 'suffix', 'error', 'hint'],
    };

    private inputEl: HTMLInputElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-input');

        // 查找 input 元素（由模板注入）
        this.inputEl = this.el.querySelector('[data-content="input:field"]') as HTMLInputElement;

        // 绑定 input 事件 → 同步到 ValueAbility
        if (this.inputEl) {
            this.inputEl.addEventListener('input', () => {
                this.value = this.inputEl!.value;
            });
        }
    }

    update(props?: Record<string, any>): void {
        if (props?.value !== undefined && this.inputEl) {
            this.inputEl.value = props.value;
        }
        if (props?.placeholder !== undefined && this.inputEl) {
            this.inputEl.placeholder = props.placeholder;
        }
    }
}
