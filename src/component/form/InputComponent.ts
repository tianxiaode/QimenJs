import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { FIELD_ACTION } from './constants';
import { FORMFIELD_TPL } from './formfield-tpl';
import './input.css';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

const InputComponentDefs: Definitions = {
    options: {
        value: '',
        placeholder: null,
        type: 'text',
        readonly: false,
        maxLength: null,
    },
} as const;

class InputComponent extends FormFieldComponent {
    static type = 'input';

    get tpl(): TemplateDecl {
        return FORMFIELD_TPL;
    }

    _focused: boolean = false;

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

    /** fieldBody item 点击分发：clear 按钮（子类覆写需调 super 保持 clear） */
    onFieldItemClick(domEvt?: any): void {
        if (domEvt?.action === FIELD_ACTION.CLEAR) this.onClearBtnClick();
    }

    onClearBtnClick(): void {
        this.value = '';
        this.emit('input', { value: '' });
        this._toggleClearBtn();
        this._fieldItem?.focus();
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
