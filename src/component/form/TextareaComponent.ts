/**
 * TextareaComponent 多行文本组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过 body.nodes 指定 fieldBody 为 TextareaFieldBodyComponent。
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
import { TextareaFieldBodyComponent } from './TextareaFieldBodyComponent';
import type { ValidationRule } from '@qimenjs/schema';

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

function getFieldEl(cmp: any): HTMLTextAreaElement | null {
    return cmp.nodeMap?.field?.el as HTMLTextAreaElement | null;
}

export let TextareaComponent = FormFieldComponent.replace({
    body: {
        nodes: {
            root: { addCls: 'q-textarea' },
            fieldBody: {
                type: TextareaFieldBodyComponent,
            },
        },

        _value: '',
        _focused: false,
        _autoSize: false as boolean | { minRows?: number; maxRows?: number },
        _minRows: 1 as number,
        _maxRows: Infinity as number,

        onAfterInit(props?: TextareaProps): void {
            const self = this as any;
            self._initTextarea(props);
        },

        _initTextarea(props?: TextareaProps): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            const fieldBodyCmp = self.nodeMap?.fieldBody?.component;
            if (fieldBodyCmp) {
                fieldBodyCmp.on('input', () => self.onFieldInput());
                fieldBodyCmp.on('focus', () => self.onFieldFocus());
                fieldBodyCmp.on('blur', () => self.onFieldBlur());
                fieldBodyCmp.on('change', () => self.onFieldChange());
            }

            if (props?.value !== undefined) {
                self._value = props.value;
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
            if (props?.disabled) self.disabled = true;
            if (props?.readonly) self.readonly = true;

            if (props?.autoSize) {
                self._autoSize = props.autoSize;
                if (typeof props.autoSize === 'object') {
                    self._minRows = props.autoSize.minRows ?? 1;
                    self._maxRows = props.autoSize.maxRows ?? Infinity;
                }
                self._autoResize();
            }

            self._applyState();
        },

        onFieldInput(): void {
            const self = this as any;
            self._value = getFieldEl(self)?.value ?? '';
            if (self._autoSize) self._autoResize();
            if (self._shouldValidate('input')) self._doValidate();
        },

        onFieldFocus(): void {
            const self = this as any;
            self._focused = true;
            self._applyState();
        },

        onFieldBlur(): void {
            const self = this as any;
            self._focused = false;
            self._applyState();
            if (self._shouldValidate('blur')) self._doValidate();
        },

        onFieldChange(): void {
            const self = this as any;
            self._value = getFieldEl(self)?.value ?? '';
            if (self._shouldValidate('change')) self._doValidate();
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        _autoResize(): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (!fieldEl) return;

            fieldEl.style.height = 'auto';
            const lineHeight = parseFloat(getComputedStyle(fieldEl).lineHeight) || 20;
            const paddingTop = parseFloat(getComputedStyle(fieldEl).paddingTop) || 0;
            const paddingBottom = parseFloat(getComputedStyle(fieldEl).paddingBottom) || 0;
            const baseHeight = paddingTop + paddingBottom;

            const minH = baseHeight + lineHeight * self._minRows;
            const maxH =
                self._maxRows === Infinity ? Infinity : baseHeight + lineHeight * self._maxRows;

            const scrollH = fieldEl.scrollHeight;
            const newH = Math.max(minH, Math.min(scrollH, maxH));

            fieldEl.style.height = `${newH}px`;
            fieldEl.style.overflow = scrollH > maxH ? 'auto' : 'hidden';
        },

        get value(): string {
            const self = this as any;
            return self._value;
        },
        set value(v: string) {
            const self = this as any;
            self._value = v;
            const fieldEl = getFieldEl(self);
            if (fieldEl && fieldEl.value !== v) {
                fieldEl.value = v;
            }
            if (self._autoSize) self._autoResize();
        },

        get disabled(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-textarea--disabled');
        },
        set disabled(v: boolean) {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (fieldEl) {
                if (v) fieldEl.setAttribute('disabled', 'true');
                else fieldEl.removeAttribute('disabled');
            }
            self.toggleCls('q-textarea--disabled', v);
        },

        get readonly(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-textarea--readonly');
        },
        set readonly(v: boolean) {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (fieldEl) {
                if (v) fieldEl.setAttribute('readonly', 'true');
                else fieldEl.removeAttribute('readonly');
            }
            self.toggleCls('q-textarea--readonly', v);
        },

        focus(): void {
            getFieldEl(this)?.focus();
        },

        blur(): void {
            getFieldEl(this)?.blur();
        },

        _applyState(): void {
            const self = this as any;
            self.toggleCls('q-textarea--focused', self._focused);
            self.toggleCls('q-textarea--error', !!self._error);
        },

        getFormValue(): any {
            const self = this as any;
            return self._value;
        },

        setFormValue(v: any): void {
            const self = this as any;
            self.value = v;
        },

        getFormDisplayValue(): any {
            const self = this as any;
            return self._value;
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self.value = defaultValue ?? '';
            self.error = '';
        },

        update(props?: Partial<TextareaProps>): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            self._super.update(props);

            if (props?.value !== undefined) self.value = props.value;
            if (props?.placeholder !== undefined && fieldEl) {
                fieldEl.setAttribute('placeholder', props.placeholder);
            }
            if (props?.rows !== undefined && fieldEl) {
                fieldEl.setAttribute('rows', String(props.rows));
            }
            if (props?.disabled !== undefined) self.disabled = props.disabled;
            if (props?.readonly !== undefined) self.readonly = props.readonly;
            if (props?.maxLength !== undefined && fieldEl) {
                fieldEl.setAttribute('maxlength', String(props.maxLength));
            }
            if (props?.resize !== undefined && fieldEl) {
                fieldEl.style.resize = props.resize;
            }
            if (props?.autoSize !== undefined) {
                self._autoSize = props.autoSize;
                if (typeof props.autoSize === 'object') {
                    self._minRows = props.autoSize.minRows ?? 1;
                    self._maxRows = props.autoSize.maxRows ?? Infinity;
                }
                self._autoResize();
            }
        },
    },
});

export type TextareaComponent = InstanceType<typeof TextareaComponent>;
