/**
 * SelectComponent 下拉选择组件
 *
 * abilities: [ValueAbility, OptionsAbility, SearchAbility]
 */

import { ComponentBase } from '../ComponentBase';
import { ValueAbility } from '../abilities/ValueAbility';
import { OptionsAbility } from '../abilities/OptionsAbility';
import { SearchAbility } from '../abilities/SearchAbility';

export class SelectComponent extends ComponentBase {
    static override readonly abilities = [ValueAbility, OptionsAbility, SearchAbility];

    private selectEl: HTMLSelectElement | null = null;

    constructor(props?: Record<string, any>) {
        super(props);

        // 创建 DOM 元素
        this.el = document.createElement('div');
        this.el.className = 'q-select';

        this.el.innerHTML = `<select class="q-select__field" data-ref="select"></select>`;

        this.selectEl = this.el.querySelector('[data-ref="select"]') as HTMLSelectElement;

        // 设置初始选项
        if (props?.options && this.selectEl) {
            this.renderOptions(props.options);
        }

        // 绑定 change 事件
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
