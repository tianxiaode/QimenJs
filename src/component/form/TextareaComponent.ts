/**
 * TextareaComponent 多行文本组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * fieldBody 子组件为 TextareaFieldBodyComponent（由 TEXTAREA_TPL 指定）。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   文本域封装：textarea
 * - infoGroup   信息封装：InputInfoGroupComponent (error/help/扩展信息)
 *
 * Textarea 特有功能：
 * - value/disabled/readonly 属性
 * - rows/resize/autoSize 控制
 * - maxLength 字数限制
 * - field 事件处理（input/focus/blur/change）
 *
 * 事件：input / focus / blur / change。
 *
 * @example
 * ```ts
 * new TextareaComponent({ value: 'hello', placeholder: '请输入', rows: 4 })
 * new TextareaComponent({ label: '描述', labelPosition: 'left', required: true })
 * textarea.on('input', ({ value }) => { ... })
 * ```
 */

import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import type { TplNode } from '@qimenjs/component-core';
import { TEXTAREA_TPL } from './textarea-tpl';
import './textarea.css.ts';

export interface TextareaProps extends FormFieldProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    rows?: number;
    autoSize?: boolean | { minRows?: number; maxRows?: number };
    maxLength?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

class TextareaComponent extends FormFieldComponent {
    get tpl(): TplNode {
        return TEXTAREA_TPL;
    }

    _value: string = '';
    _focused: boolean = false;
    _autoSize: boolean | { minRows?: number; maxRows?: number } = false;
    _minRows: number = 1;
    _maxRows: number = Infinity;

    onAfterInit(props?: TextareaProps): void {
        super.onAfterInit(props);
        this.addCls('q-textarea');
        this._initTextarea(props);
    }

    _initTextarea(props?: TextareaProps): void {
        const fieldEl = this.field;

        const fieldBodyCmp = this.nodeMap?.fieldBody?.component;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('input', () => this.onFieldInput());
            fieldBodyCmp.on('focus', () => this.onFieldFocus());
            fieldBodyCmp.on('blur', () => this.onFieldBlur());
            fieldBodyCmp.on('change', () => this.onFieldChange());
        }

        if (props?.value !== undefined) {
            this._value = props.value;
            if (fieldEl) fieldEl.value = props.value;
        }
        if (props?.placeholder && fieldEl) {
            fieldEl.setAttribute('placeholder', props.placeholder);
        }
        if (props?.rows !== undefined && fieldEl) {
            fieldEl.setAttribute('rows', String(props.rows));
        }
        if (props?.maxLength !== undefined && fieldEl) {
            fieldEl.setAttribute('maxlength', String(props.maxLength));
        }
        if (props?.resize && fieldEl) {
            fieldEl.style.resize = props.resize;
        }
        if (props?.disabled) this.disabled = true;
        if (props?.readonly) this.readonly = true;

        if (props?.autoSize) {
            this._autoSize = props.autoSize;
            if (typeof props.autoSize === 'object') {
                this._minRows = props.autoSize.minRows ?? 1;
                this._maxRows = props.autoSize.maxRows ?? Infinity;
            }
            this._autoResize();
        }

        this._applyState();
    }

    onFieldInput(): void {
        this._value = this.field?.value ?? '';
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
        this._value = this.field?.value ?? '';
        if (this._shouldValidate('change')) this._doValidate();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    _autoResize(): void {
        const fieldEl = this.field;
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

    get value(): string {
        return this._value;
    }
    set value(v: string) {
        this._value = v;
        const fieldEl = this.field;
        if (fieldEl && fieldEl.value !== v) {
            fieldEl.value = v;
        }
        if (this._autoSize) this._autoResize();
    }

    get disabled(): boolean {
        return this.el.classList.contains('q-textarea--disabled');
    }
    set disabled(v: boolean) {
        const fieldEl = this.field;
        if (fieldEl) {
            if (v) fieldEl.setAttribute('disabled', 'true');
            else fieldEl.removeAttribute('disabled');
        }
        this.toggleCls('q-textarea--disabled', v);
    }

    get readonly(): boolean {
        return this.el.classList.contains('q-textarea--readonly');
    }
    set readonly(v: boolean) {
        const fieldEl = this.field;
        if (fieldEl) {
            if (v) fieldEl.setAttribute('readonly', 'true');
            else fieldEl.removeAttribute('readonly');
        }
        this.toggleCls('q-textarea--readonly', v);
    }

    focus(): void {
        this.field?.focus();
    }

    blur(): void {
        this.field?.blur();
    }

    _applyState(): void {
        this.toggleCls('q-textarea--focused', this._focused);
        this.toggleCls('q-textarea--error', !!this._error);
    }

    getFormValue(): any {
        return this._value;
    }

    setFormValue(v: any): void {
        this.value = v;
    }

    getFormDisplayValue(): any {
        return this._value;
    }

    formReset(defaultValue?: any): void {
        this.value = defaultValue ?? '';
        this.error = '';
    }

    update(props?: Partial<TextareaProps>): void {
        super.update(props);
        const fieldEl = this.field;

        if (props?.value !== undefined) this.value = props.value;
        if (props?.placeholder !== undefined && fieldEl) {
            fieldEl.setAttribute('placeholder', props.placeholder);
        }
        if (props?.rows !== undefined && fieldEl) {
            fieldEl.setAttribute('rows', String(props.rows));
        }
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.readonly !== undefined) this.readonly = props.readonly;
        if (props?.maxLength !== undefined && fieldEl) {
            fieldEl.setAttribute('maxlength', String(props.maxLength));
        }
        if (props?.resize !== undefined && fieldEl) {
            fieldEl.style.resize = props.resize;
        }
        if (props?.autoSize !== undefined) {
            this._autoSize = props.autoSize;
            if (typeof props.autoSize === 'object') {
                this._minRows = props.autoSize.minRows ?? 1;
                this._maxRows = props.autoSize.maxRows ?? Infinity;
            }
            this._autoResize();
        }
    }
}

export { TextareaComponent };
export type TextareaComponentInstance = InstanceType<typeof TextareaComponent>;
