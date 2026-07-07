/**
 * SelectComponent 下拉选择组件
 *
 * abilities: [TextAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility]
 * TextAbility 管理标签文本，ValueAbility 管理选中值
 */

import { ComponentBase } from '@qimenjs/component-core';
import { TextAbility } from '@qimenjs/component-abilities';
import { ValueAbility } from '@qimenjs/component-abilities';
import { OptionsAbility } from '@qimenjs/component-abilities';
import { SearchAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';

export class SelectComponent extends ComponentBase {
    static override readonly abilities = [
        TextAbility, ValueAbility, OptionsAbility,
        SearchAbility, DisableAbility, SizeAbility,
    ];

    private selectEl: HTMLSelectElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        // 创建 DOM 元素
        this.el = document.createElement('div');
        this.el.className = 'q-select';

        this.el.innerHTML = `
            <label class="q-select__label" data-ref="text"></label>
            <select class="q-select__field" data-ref="select"></select>
        `;

        this.selectEl = this.el.querySelector('[data-ref="select"]') as HTMLSelectElement;

        // 设置初始选项
        if (props?.options && this.selectEl) {
            this.renderOptions(props.options);
        }

        // 绑定 change 事件 → 同步到 ValueAbility
        if (this.selectEl) {
            this.selectEl.addEventListener('change', () => {
                this.value = this.selectEl!.value;
            });
        }
    }

    override update(props?: Record<string, any>): void {
        if (props?.options && this.selectEl) {
            this.renderOptions(props.options);
        }
    }

    private renderOptions(options: any[]): void {
        if (!this.selectEl) return;

        this.selectEl.innerHTML = '';
        for (const opt of options) {
            const option = document.createElement('option');
            option.value = typeof opt === 'object' ? opt.value : opt;
            option.textContent = typeof opt === 'object' ? opt.label : String(opt);
            this.selectEl.appendChild(option);
        }
    }
}
