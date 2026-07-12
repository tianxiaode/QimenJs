/**
 * SelectComponent 下拉选择组件
 *
 * abilities: [ElementEventAbility, ContentAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility]
 * ContentAbility 管理标签文本，ValueAbility 管理选中值
 * ElementEventAbility 自动绑定模板中 data-event 声明的事件
 *
 * 事件处理（由 ElementEventAbility 自动绑定）：
 * - onField — select:field 的 change 事件（方法名从 data-content 推导）
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix, ElementEventAbility } from '@qimenjs/component-abilities';
import { ValueAbility } from '@qimenjs/component-abilities';
import { OptionsAbility } from '@qimenjs/component-abilities';
import { SearchAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';
import { SELECT_TEMPLATE } from '@qimenjs/component-core';

const SelectBase = ComponentBase.withTemplate(SELECT_TEMPLATE);

export class SelectComponent extends SelectBase {
    static readonly abilities = [
        ElementEventAbility, ContentAbility, ValueAbility, OptionsAbility,
        SearchAbility, DisableAbility, SizeAbility,
    ];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['label'],
    };

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-select');

        // 设置初始选项
        if (props?.options) {
            this.renderOptions(props.options);
        }
    }

    /**
     * select:field 的 change 事件处理
     * 由 ElementEventAbility 自动绑定（模板中 data-event="change"）
     * 方法名从 data-content="select:field" 推导：单 group → onField
     */
    onField(_event: Event, el: HTMLSelectElement): void {
        this.value = el.value;
    }

    update(props?: Record<string, any>): void {
        if (props?.options) {
            this.renderOptions(props.options);
        }
    }

    private renderOptions(options: any[]): void {
        const selectEl = this.nodeMap['select']?.['field']?.el as HTMLSelectElement | null;
        if (!selectEl) return;

        selectEl.innerHTML = '';
        for (const opt of options) {
            const option = document.createElement('option');
            option.value = typeof opt === 'object' ? opt.value : opt;
            option.textContent = typeof opt === 'object' ? opt.label : String(opt);
            selectEl.appendChild(option);
        }
    }
}
