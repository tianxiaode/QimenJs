import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { FORMFIELD_TPL } from './formfield-tpl';
import './radiogroup.css';
import './selection-group.css';

export interface RadioOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

/** 纯 DOM 选项 item（同步渲染不走组件链，避免组件 option 同步冲掉手工节点；dot 位置由 CSS order 调整） */
const radioItemTpl = (label: string): any => ({
    tag: 'span',
    classes: 'q-radio-group__item',
    options: { text: label },
    children: [{ tag: 'span', classes: 'q-radio' }],
});

const RadioGroupComponentDefs: Definitions = {
    options: {
        value: null,
        direction: 'vertical',
        items: [],
        fieldType: null,
    },
} as const;

class RadioGroupComponent extends FormFieldComponent {
    static type = 'radio-group';

    get tpl(): TemplateDecl {
        return FORMFIELD_TPL;
    }

    _radioItems: any[] = [];

    _onValueOptionChange(_value: string | number | null): void {
        this._updateCheckedState();
    }

    _onDirectionOptionChange(value: string): void {
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.direction = value;
        }
    }

    _onItemsOptionChange(_value: RadioOption[]): void {
        this._renderOptions();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        this._renderOptions();
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-radio-group');
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.addCls('q-radio-group__wrapper');
            fieldBodyCmp.direction = this.direction;
            fieldBodyCmp.gap = '8px';
        }
        this._renderOptions();
    }

    _renderOptions(): void {
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (!fieldBodyCmp) return;

        fieldBodyCmp.clear();
        this._radioItems = [];

        const items = this.items ?? [];
        for (const opt of items) {
            const checked = this.value === opt.value;
            const itemObj = fieldBodyCmp.add(radioItemTpl(opt.label));
            if (!itemObj) continue;

            const el = itemObj.el as HTMLElement;
            el.classList.toggle('q-radio-group__item--checked', checked);
            el.classList.toggle(
                'q-radio-group__item--disabled',
                !!opt.disabled || this.disable
            );
            el.setAttribute('role', 'radio');
            el.setAttribute('aria-checked', String(checked));

            this._radioItems.push({ item: itemObj, option: opt });
        }
    }

    /** 覆写基类统一监听：按 items 反查命中项 */
    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        const target = domEvt?.data?.originalEvent?.target as Element | undefined;
        if (!target) return;
        const entry = this._radioItems.find((e: any) => e.item?.el?.contains(target));
        if (!entry) return;
        const opt = entry.option;
        if (opt.disabled || this.disable) return;
        this._onRadioClick(opt.value);
    }

    /** 点击已选项 = 取消全部选择（value 置 null） */
    _onRadioClick(value: string | number): void {
        this.value = this.value === value ? null : value;
        this.emit('radio:change', { value: this.value });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateCheckedState(): void {
        for (const { item, option } of this._radioItems) {
            const checked = this.value === option.value;
            const el = item.el as HTMLElement;
            if (!el) continue;

            el.classList.toggle('q-radio-group__item--checked', checked);
            el.setAttribute('aria-checked', String(checked));

            const dot = el.querySelector('.q-radio') as HTMLElement | null;
            if (dot) {
                dot.classList.toggle('q-radio--checked', checked);
            }
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this.value };
    }

    _applyState(): void {
        this.toggleCls('q-radio-group--disabled', this.disable);
        this.toggleCls('q-radio-group--error', !!this._error);
    }

    getFormValue(): any {
        return this.value;
    }

    setFormValue(v: any): void {
        this.value = v;
        this._updateCheckedState();
    }

    formReset(defaultValue?: any): void {
        this.value = defaultValue ?? null;
        this._updateCheckedState();
        this.error = '';
    }
}

RadioGroupComponent.define(RadioGroupComponentDefs);

export { RadioGroupComponent };
export type RadioGroupComponentInstance = InstanceType<typeof RadioGroupComponent>;
