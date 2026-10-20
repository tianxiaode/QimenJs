import { TextComponent } from '../text/TextComponent';
import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl, DomEventsMap } from '@/component-core';
import { Definitions } from '@/composable';
import { FORMFIELD_TPL } from './formfield-tpl';
import './checkboxgroup.css';
import './selection-group.css';

export interface CheckboxOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

const CheckboxGroupComponentDefs: Definitions = {
    options: {
        value: [],
        direction: 'vertical',
        items: [],
        fieldType: null,
    },
} as const;

class CheckboxGroupComponent extends FormFieldComponent {
    static type = 'checkbox-group';

    get tpl(): TemplateDecl {
        return FORMFIELD_TPL;
    }

    domEvents: DomEventsMap = {
        click: [{ path: 'fieldBody', handler: '_onGroupAreaClick' }],
    };

    _checkboxItems: any[] = [];

    _onValueOptionChange(value: (string | number)[]): void {
        this._updateCheckedState();
    }

    _onDirectionOptionChange(value: string): void {
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.direction = value;
        }
    }

    _onItemsOptionChange(_value: CheckboxOption[]): void {
        this._renderOptions();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        this._renderOptions();
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-checkbox-group');
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.addCls('q-checkbox-group__wrapper');
            fieldBodyCmp.direction = this.direction;
            fieldBodyCmp.gap = '8px';
        }
        this._renderOptions();
    }

    _renderOptions(): void {
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (!fieldBodyCmp) return;

        fieldBodyCmp.clear();
        this._checkboxItems = [];

        const items = this.items ?? [];
        const currentValues = this.value ?? [];
        for (const opt of items) {
            const checked = currentValues.includes(opt.value);
            fieldBodyCmp.add({
                type: TextComponent,
                cls: 'q-checkbox-group__item',
                text: opt.label,
                order: 0,
            });
            const itemObj = fieldBodyCmp.items[fieldBodyCmp.items.length - 1];
            if (itemObj) {
                const el = itemObj.el as HTMLElement;
                if (el) {
                    el.classList.toggle('q-checkbox-group__item--checked', checked);
                    el.classList.toggle(
                        'q-checkbox-group__item--disabled',
                        !!opt.disabled || this.disable
                    );

                    const box = document.createElement('span');
                    box.className = 'q-checkbox';
                    if (checked) box.classList.add('q-checkbox--checked');
                    el.insertBefore(box, el.firstChild);

                    el.setAttribute('role', 'checkbox');
                    el.setAttribute('aria-checked', String(checked));

                    if (!opt.disabled && !this.disable) {
                        itemObj.cursor = 'pointer';
                    }
                }
                this._checkboxItems.push({ item: itemObj, option: opt });
            }
        }
    }

    /** fieldBody 区域 click 统一分发：按 items 反查命中项，替代逐项 addEventListener */
    _onGroupAreaClick(domEvt?: any): void {
        const target = domEvt?.data?.originalEvent?.target as Element | undefined;
        if (!target) return;
        const entry = this._checkboxItems.find((e: any) => e.item?.el?.contains(target));
        if (!entry) return;
        const opt = entry.option;
        if (opt.disabled || this.disable) return;
        this._onCheckboxClick(opt.value);
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

            const box = el.querySelector('.q-checkbox') as HTMLElement | null;
            if (box) {
                box.classList.toggle('q-checkbox--checked', checked);
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
