import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { FORMFIELD_TPL } from './formfield-tpl';
import { FIELD_ACTION } from './constants';
import './checkboxgroup.css';
import './selection-group.css';

export interface CheckboxOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

/** 纯 DOM 选项 item（同步渲染不走组件链，避免组件 option 同步冲掉手工节点；box 位置由 CSS order 调整） */
const checkboxItemTpl = (label: string): any => ({
    tag: 'span',
    classes: 'q-checkbox-group__item',
    options: { text: label },
    children: [{ tag: 'span', classes: 'q-checkbox' }],
});

const CheckboxGroupComponentDefs: Definitions = {
    options: {
        value: [],
        direction: 'vertical',
        items: [],
        fieldType: null,
        selectAll: false,
    },
} as const;

class CheckboxGroupComponent extends FormFieldComponent {
    static type = 'checkbox-group';

    get tpl(): TemplateDecl {
        return FORMFIELD_TPL;
    }

    _checkboxItems: any[] = [];
    _selectAllItem: any = null;

    _onValueOptionChange(value: (string | number)[]): void {
        this._updateCheckedState();
    }

    _onSelectAllOptionChange(_value: boolean): void {
        this._renderOptions();
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
        this._selectAllItem = null;

        if (this.selectAll) this._renderSelectAll(fieldBodyCmp);

        const items = this.items ?? [];
        const currentValues = this.value ?? [];
        for (const opt of items) {
            const checked = currentValues.includes(opt.value);
            const itemObj = fieldBodyCmp.add(checkboxItemTpl(opt.label));
            if (!itemObj) continue;

            const el = itemObj.el as HTMLElement;
            el.classList.toggle('q-checkbox-group__item--checked', checked);
            el.classList.toggle(
                'q-checkbox-group__item--disabled',
                !!opt.disabled || this.disable
            );
            el.setAttribute('role', 'checkbox');
            el.setAttribute('aria-checked', String(checked));

            this._checkboxItems.push({ item: itemObj, option: opt });
        }
    }

    /** 组头全选框（selectAll=true 时渲染，action=select-all 经基类统一监听分发） */
    _renderSelectAll(fieldBodyCmp: any): void {
        fieldBodyCmp.add({
            ...checkboxItemTpl('全选'),
            classes: 'q-checkbox-group__item q-checkbox-group__select-all',
            action: FIELD_ACTION.SELECT_ALL,
        });
        this._selectAllItem = fieldBodyCmp.items[fieldBodyCmp.items.length - 1];
        const el = this._selectAllItem?.el as HTMLElement | undefined;
        if (!el) return;
        el.setAttribute('role', 'checkbox');
        this._updateSelectAllState();
    }

    /** 覆写基类统一监听：全选框分发 + 按 items 反查命中项 */
    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        const target = domEvt?.data?.originalEvent?.target as Element | undefined;
        if (!target) return;

        if (this._selectAllItem?.el?.contains(target)) {
            if (!this.disable) this._onSelectAllClick();
            return;
        }

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

    /** 全选/全不选切换：已全选则清空，否则选全部项 */
    _onSelectAllClick(): void {
        const allValues = ((this.items ?? []) as CheckboxOption[]).map(o => o.value);
        const allSelected =
            allValues.length > 0 &&
            allValues.every((v: string | number) => (this.value ?? []).includes(v));
        this.value = allSelected ? [] : allValues;
        this._updateCheckedState();
        this.emit('checkbox:change', { value: [...(this.value ?? [])] });
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
        this._updateSelectAllState();
    }

    /** 全选框三态同步：全选勾/部分半选（indeterminate）/未选空 */
    _updateSelectAllState(): void {
        if (!this._selectAllItem) return;
        const el = this._selectAllItem.el as HTMLElement | undefined;
        if (!el) return;

        const total = (this.items ?? []).length;
        const count = (this.value ?? []).length;
        const all = total > 0 && count >= total;
        const some = count > 0 && count < total;

        el.classList.toggle('q-checkbox-group__item--checked', all);
        el.setAttribute('aria-checked', some ? 'mixed' : String(all));

        const box = el.querySelector('.q-checkbox') as HTMLElement | null;
        if (box) {
            box.classList.toggle('q-checkbox--checked', all);
            box.classList.toggle('q-checkbox--indeterminate', !all && some);
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
