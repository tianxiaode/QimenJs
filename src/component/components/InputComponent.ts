/**
 * InputComponent 输入框组件
 *
 * abilities: [TextAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility]
 * TextAbility 管理标签文本，ValueAbility 管理输入值
 */

import { ComponentBase } from '../ComponentBase';
import { TextAbility } from '../abilities/TextAbility';
import { ValueAbility } from '../abilities/ValueAbility';
import { ValidateAbility } from '../abilities/ValidateAbility';
import { PlaceholderAbility } from '../abilities/PlaceholderAbility';
import { DisableAbility } from '../abilities/DisableAbility';
import { SizeAbility } from '../abilities/SizeAbility';

export class InputComponent extends ComponentBase {
    static override readonly abilities = [
        TextAbility, ValueAbility, ValidateAbility,
        PlaceholderAbility, DisableAbility, SizeAbility,
    ];

    private inputEl: HTMLInputElement | null = null;
    private errorEl: HTMLElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        // 创建 DOM 元素
        this.el = document.createElement('div');
        this.el.className = 'q-input';

        this.el.innerHTML = `
            <label class="q-input__label" data-ref="text"></label>
            <input class="q-input__field" data-ref="input" />
            <span class="q-input__error" data-ref="error"></span>
        `;

        this.inputEl = this.el.querySelector('[data-ref="input"]') as HTMLInputElement;
        this.errorEl = this.el.querySelector('[data-ref="error"]') as HTMLElement;

        // 绑定 input 事件 → 同步到 ValueAbility
        if (this.inputEl) {
            this.inputEl.addEventListener('input', () => {
                this.value = this.inputEl!.value;
            });
        }
    }

    override update(props?: Record<string, any>): void {
        if (props?.value !== undefined && this.inputEl) {
            this.inputEl.value = props.value;
        }
        if (props?.placeholder !== undefined && this.inputEl) {
            this.inputEl.placeholder = props.placeholder;
        }
    }
}
