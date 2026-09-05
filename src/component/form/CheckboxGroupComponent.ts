import { TextComponent } from '../text/TextComponent';
import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { CHECKBOX_GROUP_TPL } from './checkbox-group-tpl';
import './checkboxgroup.css';
import './selection-group.css';

export interface CheckboxOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface CheckboxGroupProps extends FormFieldProps {
    items?: CheckboxOption[];
    value?: (string | number)[];
    direction?: 'vertical' | 'horizontal';
    disable?: boolean;
}

const CheckboxGroupComponentDefs: Definitions = {
    options: {
        value: [],
        direction: 'vertical',
        items: [],
    },
} as const;

class CheckboxGroupComponent extends FormFieldComponent {
    static type = 'checkbox-group';

    get tpl(): TemplateDecl {
        return CHECKBOX_GROUP_TPL;
    }

    _checkboxItems: any[] = [];

    _onValueOptionChange(value: (string | number)[]): void {
        this._updateCheckedState();
    }

    _onDirectionOptionChange(value: string): void {
        const optionsCmp = this.getComponent('options') as any;
        if (optionsCmp) {
            optionsCmp.direction = value;
        }
    }

    _onItemsOptionChange(_value: CheckboxOption[]): void {
        this._renderOptions();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = this._composeStateCls(null, 'disabled');
        value ? this.addCls(cls) : this.removeCls(cls);
        this._renderOptions();
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-checkbox-group');
        this._renderOptions();
    }

    _renderOptions(): void {
        const optionsCmp = this.getComponent('options') as any;
        if (!optionsCmp) return;

        optionsCmp.clear();
        this._checkboxItems = [];

        const items = this.items ?? [];
        const currentValues = this.value ?? [];
        for (const opt of items) {
            const checked = currentValues.includes(opt.value);
            optionsCmp.add({
                type: TextComponent,
                cls: 'q-checkbox-group__item',
                text: opt.label,
                order: 0,
            });
            const itemObj = optionsCmp._items[optionsCmp._items.length - 1];
            if (itemObj) {
                const el = itemObj.el as HTMLElement;
                if (el) {
                    el.classList.toggle('q-checkbox-group__item--checked', checked);
                    el.classList.toggle(
                        'q-checkbox-group__item--disabled',
                        !!opt.disabled || this.disable
                    );

                    const box = document.createElement('span');
                    box.className = 'q-checkbox-group__box';
                    if (checked) box.classList.add('q-checkbox-group__box--checked');
                    el.insertBefore(box, el.firstChild);

                    el.setAttribute('role', 'checkbox');
                    el.setAttribute('aria-checked', String(checked));

                    if (!opt.disabled && !this.disable) {
                        el.style.cursor = 'pointer';
                        el.addEventListener('click', () => {
                            this._onCheckboxClick(opt.value);
                        });
                    }
                }
                this._checkboxItems.push({ item: itemObj, option: opt });
            }
        }
    }

    _onCheckboxClick(value: string | number): void {
        const currentValues = this.value ?? [];
        const idx = currentValues.indexOf(value);
        const newValues = [...currentValues];
        if (idx >= 0) {
            newValues.splice(idx, 1);
        } else {
            newValues.push(value);
        }
        this.value = newValues;
        this._updateCheckedState();
        this.emit('checkbox:change', { value: [...newValues] });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateCheckedState(): void {
        const currentValues = this.value ?? [];
        for (const { item, option } of this._checkboxItems) {
            const checked = currentValues.includes(option.value);
            const el = item.el as HTMLElement;
            if (!el) continue;

            el.classList.toggle('q-checkbox-group__item--checked', checked);
            el.setAttribute('aria-checked', String(checked));

            const box = el.querySelector('.q-checkbox-group__box') as HTMLElement | null;
            if (box) {
                box.classList.toggle('q-checkbox-group__box--checked', checked);
            }
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: [...(this.value ?? [])] };
    }

    _applyState(): void {
        this.toggleCls('q-checkbox-group--disabled', this.disable);
        this.toggleCls('q-checkbox-group--error', !!this._error);
    }

    getFormValue(): any {
        return [...(this.value ?? [])];
    }

    setFormValue(v: any): void {
        this.value = Array.isArray(v) ? [...v] : [];
        this._updateCheckedState();
    }

    formReset(defaultValue?: any): void {
        this.value = Array.isArray(defaultValue) ? [...defaultValue] : [];
        this._updateCheckedState();
        this.error = '';
    }
}

CheckboxGroupComponent.define(CheckboxGroupComponentDefs);

export { CheckboxGroupComponent };
export type CheckboxGroupComponentInstance = InstanceType<typeof CheckboxGroupComponent>;
