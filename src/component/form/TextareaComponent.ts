import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl, DomEventsMap } from '@/component-core';
import { Definitions } from '@/composable';
import { TextareaFieldComponent } from './TextareaFieldComponent';
import { TEXTAREA_TPL } from './textarea-tpl';
import { FIELD_ITEM_ORDER } from './constants';
import './textarea.css';

const TextareaComponentDefs: Definitions = {
    options: {
        value: '',
        placeholder: null,
        readonly: false,
        rows: null,
        maxLength: null,
        resize: null,
        autoSize: false,
    },
} as const;

class TextareaComponent extends FormFieldComponent {
    static type = 'textarea';

    get tpl(): TemplateDecl {
        return TEXTAREA_TPL;
    }

    domEvents: DomEventsMap = {
        input: [{ path: '{textarea-field}', handler: 'onFieldInput' }],
        focus: [{ path: '{textarea-field}', handler: 'onFieldFocus' }],
        blur: [{ path: '{textarea-field}', handler: 'onFieldBlur' }],
        change: [{ path: '{textarea-field}', handler: 'onFieldChange' }],
    };

    _focused: boolean = false;
    _autoSize: boolean | { minRows?: number; maxRows?: number } = false;
    _minRows: number = 1;
    _maxRows: number = Infinity;
    _fieldItem: any = null;

    createChildren(childReady?: () => void): void {
        super.createChildren(childReady);
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp && !this._fieldItem) {
            fieldBodyCmp.addCls('q-textarea__wrapper');
            this._fieldItem = fieldBodyCmp.add({
                type: TextareaFieldComponent,
                order: FIELD_ITEM_ORDER,
            });
        }
    }

    _getFieldEl(): HTMLTextAreaElement | undefined {
        return this._fieldItem?.el as HTMLTextAreaElement | undefined;
    }

    _onValueOptionChange(value: string): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.value = value;
        if (this._autoSize) this._autoResize();
    }

    _onPlaceholderOptionChange(value: string | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.placeholder = value;
    }

    _onReadonlyOptionChange(value: boolean): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.readonly = value;
        this.toggleCls('q-textarea--readonly', value);
    }

    _onRowsOptionChange(value: number | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.rows = value;
    }

    _onMaxLengthOptionChange(value: number | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.maxLength = value;
    }

    _onResizeOptionChange(value: string | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.resize = value;
    }

    _onAutoSizeOptionChange(value: boolean | { minRows?: number; maxRows?: number }): void {
        this._autoSize = value;
        if (typeof value === 'object') {
            this._minRows = value.minRows ?? 1;
            this._maxRows = value.maxRows ?? Infinity;
        } else {
            this._minRows = 1;
            this._maxRows = Infinity;
        }
        if (value) this._autoResize();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.disabled = value;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-textarea');
    }

    onFieldInput(): void {
        const fieldEl = this._getFieldEl();
        this.value = fieldEl?.value ?? '';
        if (this._autoSize) this._autoResize();
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

    _autoResize(): void {
        const fieldEl = this._getFieldEl();
        if (!fieldEl) return;

        fieldEl.style.height = 'auto';
        const lineHeight = parseFloat(getComputedStyle(fieldEl).lineHeight) || 20;
        const paddingTop = parseFloat(getComputedStyle(fieldEl).paddingTop) || 0;
        const paddingBottom = parseFloat(getComputedStyle(fieldEl).paddingBottom) || 0;
        const baseHeight = paddingTop + paddingBottom;

        const minH = baseHeight + lineHeight * this._minRows;
        const maxH =
            this._maxRows === Infinity ? Infinity : baseHeight + lineHeight * this._maxRows;

        const scrollH = fieldEl.scrollHeight;
        const newH = Math.max(minH, Math.min(scrollH, maxH));

        fieldEl.style.height = `${newH}px`;
        fieldEl.style.overflow = scrollH > maxH ? 'auto' : 'hidden';
    }

    focus(): void {
        this._fieldItem?.focus();
    }

    blur(): void {
        this._fieldItem?.blur();
    }

    _applyState(): void {
        this.toggleCls('q-textarea--focused', this._focused);
        this.toggleCls('q-textarea--error', !!this._error);
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

TextareaComponent.define(TextareaComponentDefs);

export { TextareaComponent };
export type TextareaComponentInstance = InstanceType<typeof TextareaComponent>;
