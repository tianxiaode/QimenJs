/**
 * FormFieldComponent 表单字段基类
 *
 * 提供所有表单字段（Input/Select/CheckboxGroup/RadioGroup）的通用逻辑：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   字段内容区：可替换子组件，el 直接充当 wrapper 层
 * - infoGroup   信息封装：error/help/扩展信息
 *
 * fieldBody 子组件的 el 同时承载 q-formfield__wrapper（布局）和
 * 具体字段样式（如 q-input__wrapper），避免多套一层 div。
 * 子组件的 nodeMap 会自动合并到父组件，可直接 this.nodeMap.field 访问。
 *
 * 构建自动生成（无需手写）：
 * - $infoGroup / $fieldBody — 子组件快捷访问（addComponentRefDesc）
 * - this.label — i18n 内容属性（addContentPropDesc + i18n: 'label'）
 *   设 i18nKey 自动翻译，locale 切换自动更新（initI18nFromTemplate）
 *
 * 通用能力：
 * - 标签位置（top/left/right）+ labelWidth 通过 CSS 变量驱动
 * - required 标记 + i18n 感知
 * - error/help 便捷方法（委托 $infoGroup）
 * - 验证逻辑：字段自验证，Form 通过 getFormError() 收集错误
 * - 表单值接口（getFormValue/setFormValue，子类覆写）
 * - SizeAbility
 *
 * @example
 * ```ts
 * const InputComponent = FormFieldComponent.replace({
 *     type: 'Input',
 *     cls: 'q-input',
 *     nodeOverrides: { fieldBody: { type: InputFieldBodyComponent } },
 *     body: { ... }
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

import type { ValidationRule } from '@qimenjs/schema';
import { validate as doValidate } from '@qimenjs/validation';
import './formfield.css';

export type LabelPosition = 'top' | 'left' | 'right';
export type ValidateTrigger = 'blur' | 'change' | 'input';

export interface FormFieldProps {
    label?: string;
    i18nLabel?: string;
    labelPosition?: LabelPosition;
    labelWidth?: string;
    required?: boolean;
    requiredMark?: string;
    requiredMarkPosition?: 'before' | 'after';
    size?: 'sm' | 'md' | 'lg';
    fieldName?: string;
    validation?: boolean | ValidationRule | ValidationRule[];
    validateTrigger?: ValidateTrigger;
}

const LABEL_POSITION_MAP: Record<LabelPosition, string> = {
    top: 'q-formfield--top',
    left: 'q-formfield--left',
    right: 'q-formfield--right',
};

export let FormFieldComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-formfield',
        children: [
            {
                tag: 'div',
                name: 'labelGroup',
                cls: 'q-formfield__label-group',
                hidden: true,
                children: [
                    { tag: 'label', name: 'label', cls: 'q-formfield__label', i18n: 'label' },
                    {
                        tag: 'span',
                        name: 'requiredMark',
                        cls: 'q-formfield__required-mark',
                        hidden: true,
                    },
                    { tag: 'span', name: 'separator', cls: 'q-formfield__separator' },
                ],
            },
            {
                name: 'fieldBody',
                type: 'InputFieldBody',
                cls: 'q-formfield__wrapper',
            },
            {
                name: 'infoGroup',
                type: 'InputInfoGroup',
            },
        ],
    },
    body: {
        type: 'FormField',

        onInitState() {
            return {
                _error: '',
                _required: false,
                _requiredMark: '',
                _requiredMarkPosition: 'after' as 'before' | 'after',
                _labelText: '',
                _fieldName: '' as string,
                _validation: null as boolean | ValidationRule | ValidationRule[] | null,
                _validateTrigger: 'blur' as ValidateTrigger,
                _initialValue: undefined as any,
            };
        },

        onAfterInit(props?: FormFieldProps): void {
            this._applyLabelPosition(props?.labelPosition);
            this._applyLabelWidth(props?.labelWidth);
            this.initSize();
            this._initLabel(props);
            this._initValidation(props);
        },

        onLocaleChange(): void {
            this._applyRequiredConfig();
        },

        // ========== label 逻辑 ==========

        _applyLabelPosition(position?: LabelPosition): void {
            const pos = position || 'top';
            const cls = LABEL_POSITION_MAP[pos];
            if (cls) this.toggleCls(cls, true);
        },

        _applyLabelWidth(width?: string): void {
            if (width) {
                this.el.style.setProperty('--q-formfield-label-width', width);
            }
        },

        _initLabel(props?: FormFieldProps): void {
            const ui = this.i18nConfig()?.ui;
            this._requiredMark = props?.requiredMark ?? ui?.requiredMark ?? '*';
            this._requiredMarkPosition =
                props?.requiredMarkPosition ?? ui?.requiredMarkPosition ?? 'after';

            if (props?.i18nLabel) {
                this._labelText = props.i18nLabel;
                this.label = props.i18nLabel;
            } else if (props?.label) {
                this._labelText = props.label;
                this.label = props.label;
            }

            if (this._labelText) {
                this.setNodeHidden(false, 'labelGroup');
                this._applyRequiredConfig();
            }
            if (props?.required) {
                this._required = true;
                this._applyRequiredConfig();
                if (this._labelText) {
                    this.setNodeHidden(false, 'requiredMark');
                }
            }
        },

        _applyRequiredConfig(): void {
            const ui = this.i18nConfig()?.ui;
            const mark = this._requiredMark || ui?.requiredMark || '*';
            const position = this._requiredMarkPosition || ui?.requiredMarkPosition || 'after';

            const markEl = this.nodeMap?.requiredMark?.el as HTMLElement | null;
            if (markEl) {
                markEl.textContent = mark;
                markEl.classList.toggle(
                    'q-formfield__required-mark--before',
                    position === 'before'
                );
                markEl.classList.toggle('q-formfield__required-mark--after', position === 'after');
            }

            const separatorEl = this.nodeMap?.separator?.el as HTMLElement | null;
            if (separatorEl) {
                separatorEl.textContent = ui?.labelSeparator ?? '：';
            }
        },

        // ========== 验证逻辑（字段自验证） ==========

        _initValidation(props?: FormFieldProps): void {
            if (props?.fieldName) this._fieldName = props.fieldName;
            if (props?.validation !== undefined) this._validation = props.validation;
            if (props?.validateTrigger) this._validateTrigger = props.validateTrigger;
        },

        _shouldValidate(eventName: string): boolean {
            if (!this._validation) return false;
            if (eventName === this._validateTrigger) return true;
            if (this._validateTrigger === 'blur' && eventName === 'change') return false;
            return false;
        },

        async _doValidate(): Promise<void> {
            if (!this._validation) return;

            const rules = Array.isArray(this._validation) ? this._validation : [this._validation];
            const allErrors: any[] = [];

            for (const rule of rules) {
                const errors = await doValidate.validate(this.getFormValue(), rule);
                if (errors) allErrors.push(...errors);
            }

            this.error = allErrors.length > 0 ? allErrors[0].message || String(allErrors[0]) : '';
        },

        // ========== infoGroup 便捷方法 ==========

        addError(text: string): any {
            return this.$infoGroup?.addError(text);
        },

        removeError(): void {
            this.$infoGroup?.removeError();
        },

        addHelp(text: string): any {
            return this.$infoGroup?.addHelp(text);
        },

        removeHelp(): void {
            this.$infoGroup?.removeHelp();
        },

        addInfo(data: Record<string, any>): any {
            return this.$infoGroup?.addInfo(data);
        },

        removeInfo(index: number): any {
            return this.$infoGroup?.removeInfo(index);
        },

        // ========== 属性 ==========

        get error(): string {
            return this._error;
        },
        set error(v: string) {
            this._error = v;
            if (v) {
                this.$infoGroup?.addError(v);
                this.toggleCls('q-formfield--error', true);
            } else {
                this.$infoGroup?.removeError();
                this.toggleCls('q-formfield--error', false);
            }
        },

        get validation(): boolean | ValidationRule | ValidationRule[] | null {
            return this._validation;
        },
        set validation(v: boolean | ValidationRule | ValidationRule[] | null) {
            this._validation = v;
        },

        _applyState(): void {
            this.toggleCls('q-formfield--error', !!this._error);
        },

        // ========== 表单值接口（子类覆写） ==========

        getFormValue(): any {
            return undefined;
        },

        setFormValue(v: any): void {
            this._initialValue = v;
        },

        getFormDisplayValue(): any {
            return this.getFormValue();
        },

        getFormError(): string {
            return this._error ?? '';
        },

        formReset(defaultValue?: any): void {
            const v = defaultValue ?? this._initialValue;
            this.setFormValue(v);
            this.error = '';
        },

        // ========== update ==========

        update(props?: Partial<FormFieldProps>): void {
            if (props?.i18nLabel !== undefined) {
                this._labelText = props.i18nLabel;
                this.label = props.i18nLabel;
                this.setNodeHidden(false, 'labelGroup');
            }
            if (props?.label !== undefined) {
                this._labelText = props.label || '';
                if (props.label) {
                    this.label = props.label;
                    this.setNodeHidden(false, 'labelGroup');
                    if (this._required) {
                        this.setNodeHidden(false, 'requiredMark');
                    }
                } else {
                    this.setNodeHidden(true, 'labelGroup');
                    this.setNodeHidden(true, 'requiredMark');
                }
            }
            if (props?.labelPosition !== undefined) {
                for (const cls of Object.values(LABEL_POSITION_MAP)) {
                    this.toggleCls(cls, false);
                }
                this._applyLabelPosition(props.labelPosition);
            }
            if (props?.labelWidth !== undefined) {
                this._applyLabelWidth(props.labelWidth);
            }
            if (props?.required !== undefined) {
                this._required = props.required;
                if (props.required && this._labelText) {
                    this._applyRequiredConfig();
                    this.setNodeHidden(false, 'requiredMark');
                } else {
                    this.setNodeHidden(true, 'requiredMark');
                }
            }
            if (props?.requiredMark !== undefined) {
                this._requiredMark = props.requiredMark;
                this._applyRequiredConfig();
            }
            if (props?.requiredMarkPosition !== undefined) {
                this._requiredMarkPosition = props.requiredMarkPosition;
                this._applyRequiredConfig();
            }
            if (props?.size !== undefined) this.size = props.size;
            if (props?.fieldName !== undefined) this._fieldName = props.fieldName;
            if (props?.validation !== undefined) this._validation = props.validation;
            if (props?.validateTrigger !== undefined) this._validateTrigger = props.validateTrigger;
        },
    },
}).with([SizeAbility]);

export type FormFieldComponent = InstanceType<typeof FormFieldComponent>;
