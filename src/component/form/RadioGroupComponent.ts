import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { RADIO_GROUP_TPL } from './radio-group-tpl';
import './radiogroup.css';
import './selection-group.css';

export interface RadioOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface RadioGroupProps extends FormFieldProps {
    items?: RadioOption[];
    value?: string | number;
    direction?: 'vertical' | 'horizontal';
    disable?: boolean;
}

const RadioGroupComponentDefs: Definitions = {
    options: {
        value: null,
        direction: 'vertical',
        items: [],
    },
} as const;

class RadioGroupComponent extends FormFieldComponent {
    static type = 'radio-group';

    get tpl(): TemplateDecl {
        return RADIO_GROUP_TPL;
    }

    _radioItems: any[] = [];

    _onValueOptionChange(value: string | number | null): void {
        this._updateCheckedState();
    }

    _onDirectionOptionChange(value: string): void {
        const optionsCmp = this.getComponent('options') as any;
        if (optionsCmp) {
            optionsCmp.direction = value;
        }
    }

    _onItemsOptionChange(value: RadioOption[]): void {
        this._renderOptions();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = this._composeStateCls(null, 'disabled');
        value ? this.addCls(cls) : this.removeCls(cls);
        this._renderOptions();
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-radio-group');
        this._renderOptions();
    }

    _renderOptions(): void {
        const optionsCmp = this.getComponent('options') as any;
        if (!optionsCmp) return;

        optionsCmp.clear();
        this._radioItems = [];

        const items = this.items ?? [];
        for (const opt of items) {
            const checked = this.value === opt.value;
            optionsCmp.add({
                type: 'Text',
                cls: 'q-radio-group__item',
                text: opt.label,
                order: 0,
            });
            const itemObj = optionsCmp._items[optionsCmp._items.length - 1];
            if (itemObj) {
                const el = itemObj.el as HTMLElement;
                if (el) {
                    el.classList.toggle('q-radio-group__item--checked', checked);
                    el.classList.toggle(
                        'q-radio-group__item--disabled',
                        !!opt.disabled || this.disable
                    );

                    const dot = document.createElement('span');
                    dot.className = 'q-radio-group__dot';
                    if (checked) dot.classList.add('q-radio-group__dot--checked');
                    el.insertBefore(dot, el.firstChild);

                    el.setAttribute('role', 'radio');
                    el.setAttribute('aria-checked', String(checked));

                    if (!opt.disabled && !this.disable) {
                        el.style.cursor = 'pointer';
                        el.addEventListener('click', () => {
                            this._onRadioClick(opt.value);
                        });
                    }
                }
                this._radioItems.push({ item: itemObj, option: opt });
            }
        }
    }

    _onRadioClick(value: string | number): void {
        if (this.value === value) return;
        this.value = value;
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

            const dot = el.querySelector('.q-radio-group__dot') as HTMLElement | null;
            if (dot) {
                dot.classList.toggle('q-radio-group__dot--checked', checked);
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
