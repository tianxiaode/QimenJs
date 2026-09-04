import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import type { FormFieldProps } from './FormFieldComponent';
import { Definitions } from '@/composable';
import type { ValidationRule } from '@qimenjs/schema';
import { TextComponent } from '../text/TextComponent';
import { FORMFIELD_TPL } from './formfield-tpl';
import './input.css';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

export interface InputProps extends FormFieldProps {
    value?: string;
    placeholder?: string;
    type?: InputType;
    disable?: boolean;
    readonly?: boolean;
    maxLength?: number;
    clearable?: boolean;
}

const CLEAR_BTN_ORDER = 0;

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

    _focused: boolean = false;
    _clearable: boolean = false;
    _clearBtnItem: any = null;

    _onValueOptionChange(value: string): void {
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        if (fieldEl && fieldEl.value !== value) {
            fieldEl.value = value;
        }
        this._toggleClearBtn();
    }

    _onPlaceholderOptionChange(value: string): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value) fieldEl.setAttribute('placeholder', value);
        else fieldEl.removeAttribute('placeholder');
    }

    _onTypeOptionChange(value: string): void {
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) fieldEl.setAttribute('type', value);
    }

    _onReadonlyOptionChange(value: boolean): void {
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) {
            if (value) fieldEl.setAttribute('readonly', 'true');
            else fieldEl.removeAttribute('readonly');
        }
        this.toggleCls('q-input--readonly', value);
    }

    _onMaxLengthOptionChange(value: number | null): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value != null) fieldEl.setAttribute('maxlength', String(value));
        else fieldEl.removeAttribute('maxlength');
    }

    _onClearableOptionChange(value: boolean): void {
        this._clearable = value;
        if (value) {
            this._setNodeHidden(false, 'actions');
            this._initClearBtn();
            this._toggleClearBtn();
        } else {
            if (this._clearBtnItem) {
                this._clearBtnItem.el.hidden = true;
            }
            this._setNodeHidden(true, 'actions');
        }
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = this._composeStateCls(null, 'disabled');
        value ? this.addCls(cls) : this.removeCls(cls);
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) {
            if (value) fieldEl.setAttribute('disabled', 'true');
            else fieldEl.removeAttribute('disabled');
        }
    }

    _onSizeOptionChange(value: string, old: string): void {
        super._onSizeOptionChange(value, old);
        if (value) this.addCls(`q-input--${value}`);
        if (old) this.removeCls(`q-input--${old}`);
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-input');
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('actionClick', (data: any) => this.onFieldBodyActionClick(data));
            fieldBodyCmp.on('input', () => this.onFieldInput());
            fieldBodyCmp.on('focus', () => this.onFieldFocus());
            fieldBodyCmp.on('blur', () => this.onFieldBlur());
            fieldBodyCmp.on('change', () => this.onFieldChange());
        }
    }

    onFieldBodyActionClick(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return;
        if (this._clearBtnItem && this._itemsIndexOf(actionsCmp, this._clearBtnItem) === index) {
            this.onClearBtnClick();
        }
    }

    _itemsIndexOf(group: any, item: any): number {
        for (let i = 0; i < group._items.length; i++) {
            if (group._items[i] === item) return i;
        }
        return -1;
    }

    _initClearBtn(): void {
        if (this._clearBtnItem) return;
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return;
        actionsCmp.add({
            type: TextComponent,
            cls: 'q-input__clear-btn',
            text: '×',
            order: CLEAR_BTN_ORDER,
        });
        this._clearBtnItem = actionsCmp._items[actionsCmp._items.length - 1] ?? null;
    }

    onClearBtnClick(): void {
        this.value = '';
        this.emit('input', { value: '' });
        this._toggleClearBtn();
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        fieldEl?.focus();
    }

    _toggleClearBtn(): void {
        if (!this._clearable || !this._clearBtnItem) return;
        const hasValue = !!this.value;
        this._clearBtnItem.el.hidden = !hasValue;
    }

    onFieldInput(): void {
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
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
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        this.value = fieldEl?.value ?? '';
        if (this._shouldValidate('change')) this._doValidate();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this.value };
    }

    addAction(data: Record<string, any>): any {
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return null;
        this._setNodeHidden(false, 'actions');
        return actionsCmp.add(data);
    }

    removeAction(index: number): any {
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return undefined;
        const result = actionsCmp.removeAt(index);
        if (actionsCmp.count === 0) this._setNodeHidden(true, 'actions');
        return result;
    }

    setActionHidden(index: number, hidden: boolean): void {
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return;
        const item = actionsCmp.getAt(index);
        if (item?.el) item.el.hidden = hidden;
    }

    focus(): void {
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        fieldEl?.focus();
    }

    blur(): void {
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        fieldEl?.blur();
    }

    select(): void {
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        fieldEl?.select();
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
