import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { TEXTAREA_TPL } from './textarea-tpl';
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

    _focused: boolean = false;
    _autoSize: boolean | { minRows?: number; maxRows?: number } = false;
    _minRows: number = 1;
    _maxRows: number = Infinity;

    _onValueOptionChange(value: string): void {
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
        if (fieldEl && fieldEl.value !== value) {
            fieldEl.value = value;
        }
        if (this._autoSize) this._autoResize();
    }

    _onPlaceholderOptionChange(value: string): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value) fieldEl.setAttribute('placeholder', value);
        else fieldEl.removeAttribute('placeholder');
    }

    _onReadonlyOptionChange(value: boolean): void {
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) {
            if (value) fieldEl.setAttribute('readonly', 'true');
            else fieldEl.removeAttribute('readonly');
        }
        this.toggleCls('q-textarea--readonly', value);
    }

    _onRowsOptionChange(value: number | null): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value != null) fieldEl.setAttribute('rows', String(value));
        else fieldEl.removeAttribute('rows');
    }

    _onMaxLengthOptionChange(value: number | null): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value != null) fieldEl.setAttribute('maxlength', String(value));
        else fieldEl.removeAttribute('maxlength');
    }

    _onResizeOptionChange(value: string | null): void {
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
        if (fieldEl) {
            (fieldEl as HTMLElement).style.resize = value ?? 'vertical';
        }
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
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) {
            if (value) fieldEl.setAttribute('disabled', 'true');
            else fieldEl.removeAttribute('disabled');
        }
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-textarea');
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('input', () => this.onFieldInput());
            fieldBodyCmp.on('focus', () => this.onFieldFocus());
            fieldBodyCmp.on('blur', () => this.onFieldBlur());
            fieldBodyCmp.on('change', () => this.onFieldChange());
        }
    }

    onFieldInput(): void {
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
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
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
        this.value = fieldEl?.value ?? '';
        if (this._shouldValidate('change')) this._doValidate();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this.value };
    }

    _autoResize(): void {
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
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
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
        fieldEl?.focus();
    }

    blur(): void {
        const fieldEl = this.getNodeEl('field') as HTMLTextAreaElement | undefined;
        fieldEl?.blur();
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
