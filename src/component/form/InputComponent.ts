import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl, DomEventsMap } from '@/component-core';
import { Definitions } from '@/composable';
import type { ValidationRule } from '@qimenjs/schema';
import { IconComponent } from '../icon/IconComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { FORMFIELD_TPL } from './formfield-tpl';
import './input.css';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

const FIELD_ITEM_ORDER = 0;
const CLEAR_BTN_ORDER = 10;

const InputComponentDefs: Definitions = {
    options: {
        value: '',
        placeholder: null,
        type: 'text',
        readonly: false,
        maxLength: null,
        clearable: false,
    },
} as const;

class InputComponent extends FormFieldComponent {
    static type = 'input';

    get tpl(): TemplateDecl {
        return FORMFIELD_TPL;
    }

    domEvents: DomEventsMap = {
        input: [{ path: '{input-field}', handler: 'onFieldInput' }],
        focus: [{ path: '{input-field}', handler: 'onFieldFocus' }],
        blur: [{ path: '{input-field}', handler: 'onFieldBlur' }],
        change: [{ path: '{input-field}', handler: 'onFieldChange' }],
    };

    _focused: boolean = false;
    _clearable: boolean = false;
    _fieldItem: any = null;
    _clearBtnItem: any = null;

    createChildren(childReady?: () => void): void {
        super.createChildren(childReady);
        this._initFieldItem();
    }

    _getFieldBody(): any {
        return this.getComponent('fieldBody') as any;
    }

    _initFieldItem(): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp || this._fieldItem) return;
        fieldBodyCmp.addCls('q-input__wrapper');
        this._fieldItem = fieldBodyCmp.add({
            type: InputFieldComponent,
            order: FIELD_ITEM_ORDER,
        });
    }

    _getFieldEl(): HTMLInputElement | undefined {
        return this._fieldItem?.el as HTMLInputElement | undefined;
    }

    _onValueOptionChange(value: string): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.value = value;
        this._toggleClearBtn();
    }

    _onPlaceholderOptionChange(value: string | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.placeholder = value;
    }

    _onTypeOptionChange(value: string): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.inputType = value;
    }

    _onReadonlyOptionChange(value: boolean): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.readonly = value;
        this.toggleCls('q-input--readonly', value);
    }

    _onMaxLengthOptionChange(value: number | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.maxLength = value;
    }

    _onClearableOptionChange(value: boolean): void {
        this._clearable = value;
        if (value) {
            this._initClearBtn();
            this._toggleClearBtn();
        } else {
            this._removeClearBtn();
        }
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.disabled = value;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-input');
    }

    _initClearBtn(): void {
        if (this._clearBtnItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const item = fieldBodyCmp.add({
            type: IconComponent,
            iconCls: 'q-close',
            order: CLEAR_BTN_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__clear-btn');
            item.el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                this.onClearBtnClick();
            });
        }
        this._clearBtnItem = item;
    }

    _removeClearBtn(): void {
        if (!this._clearBtnItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._clearBtnItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._clearBtnItem = null;
    }

    onClearBtnClick(): void {
        this.value = '';
        this.emit('input', { value: '' });
        this._toggleClearBtn();
        this._fieldItem?.focus();
    }

    _toggleClearBtn(): void {
        if (!this._clearable || !this._clearBtnItem) return;
        const hasValue = !!this.value;
        this._clearBtnItem.el.classList.toggle('hidden', !hasValue);
    }

    onFieldInput(): void {
        const fieldEl = this._getFieldEl();
        this.value = fieldEl?.value ?? '';
        this._toggleClearBtn();
        if (this._shouldValidate('input')) this._doValidate();
    }

    onFieldFocus(): void {
        this._focused = true;
        this._applyState();
    }

    onFieldBlur(): void {
        this._focused = false;
        this._applyState();
        if (this._shouldValidate('blur')) this._doValidate();
    }

    onFieldChange(): void {
        const fieldEl = this._getFieldEl();
        this.value = fieldEl?.value ?? '';
        if (this._shouldValidate('change')) this._doValidate();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this.value };
    }

    addAction(data: Record<string, any>): any {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return null;
        return fieldBodyCmp.add(data);
    }

    removeAction(index: number): any {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return undefined;
        return fieldBodyCmp.removeAt(index);
    }

    setActionHidden(index: number, hidden: boolean): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const item = fieldBodyCmp.getAt(index);
        if (item?.el) item.el.hidden = hidden;
    }

    focus(): void {
        this._fieldItem?.focus();
    }

    blur(): void {
        this._fieldItem?.blur();
    }

    select(): void {
        this._fieldItem?.select();
    }

    _applyState(): void {
        this.toggleCls('q-input--focused', this._focused);
        this.toggleCls('q-input--error', !!this._error);
    }

    getFormValue(): any {
        return this.value;
    }

    setFormValue(v: any): void {
        this.value = v;
    }

    getFormDisplayValue(): any {
        return this.value;
    }

    formReset(defaultValue?: any): void {
        this.value = defaultValue ?? '';
        this.error = '';
    }
}

InputComponent.define(InputComponentDefs);

export { InputComponent };
export type InputComponentInstance = InstanceType<typeof InputComponent>;
