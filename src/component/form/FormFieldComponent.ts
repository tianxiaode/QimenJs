import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { Definitions } from '@/composable';
import { resolveI18nValue } from '@qimenjs/i18n';
import { FORMFIELD_TPL } from './formfield-tpl';
import './formfield.css';

import type { ValidationRule } from '@qimenjs/schema';
import { validate as doValidate } from '@qimenjs/validation';

export type LabelPosition = 'top' | 'left' | 'right';
export type ValidateTrigger = 'blur' | 'change' | 'input';

const LABEL_POSITION_MAP: Record<LabelPosition, string> = {
    top: 'q-formfield--top',
    left: 'q-formfield--left',
    right: 'q-formfield--right',
};

const FormFieldComponentDefs: Definitions = {
    options: {
        label: null,
        i18nLabel: null,
        labelPosition: 'top',
        labelWidth: null,
        required: false,
        requiredMark: null,
        requiredMarkPosition: 'after',
        size: null,
        colSpan: 0,
    },
    fields: {
        fieldName: '',
        validation: null,
        validateTrigger: 'blur',
    },
} as const;

class FormFieldComponent extends Component {
    static type = 'formfield';

    get tpl(): TemplateDecl {
        return FORMFIELD_TPL;
    }

    _error: string = '';
    _labelText: string = '';
    _initialValue: any = undefined;

    _onLabelOptionChange(value: string): void {
        if (value) {
            this._labelText = value;
            const el = this.getNodeEl('label');
            if (el) el.textContent = value;
            this._setNodeHidden(false, 'labelGroup');
            this._applyRequiredConfig();
        }
    }

    _onI18nLabelOptionChange(value: string): void {
        if (value) {
            const text = resolveI18nValue(value);
            this._labelText = text;
            const el = this.getNodeEl('label');
            if (el) el.textContent = text;
            this._setNodeHidden(false, 'labelGroup');
            this._applyRequiredConfig();
        }
    }

    _onLabelPositionOptionChange(value: LabelPosition): void {
        for (const cls of Object.values(LABEL_POSITION_MAP)) {
            this.removeCls(cls);
        }
        const cls = LABEL_POSITION_MAP[value];
        if (cls) this.addCls(cls);
    }

    _onLabelWidthOptionChange(value: string): void {
        if (value) {
            this.el!.style.setProperty('--q-formfield-label-width', value);
        }
    }

    _onRequiredOptionChange(value: boolean): void {
        if (value && this._labelText) {
            this._applyRequiredConfig();
            this._setNodeHidden(false, 'requiredMark');
        } else {
            this._setNodeHidden(true, 'requiredMark');
        }
    }

    _onRequiredMarkOptionChange(_value: string): void {
        this._applyRequiredConfig();
    }

    _onRequiredMarkPositionOptionChange(_value: string): void {
        this._applyRequiredConfig();
    }

    _onColSpanOptionChange(value: number): void {
        this.el!.style.gridColumn = value > 1 ? `span ${value}` : '';
    }

    onAfterInit(): void {
        this._applyRequiredConfig();
    }

    onLocaleChange(): void {
        this._applyRequiredConfig();
    }

    _applyRequiredConfig(): void {
        const ui = (this as any).i18nConfig?.()?.ui;
        const mark = this.requiredMark ?? ui?.requiredMark ?? '*';
        const position = this.requiredMarkPosition ?? ui?.requiredMarkPosition ?? 'after';

        const markEl = this.getNodeEl('requiredMark');
        if (markEl) {
            (markEl as HTMLElement).textContent = mark;
            (markEl as HTMLElement).classList.toggle('q-formfield__required-mark--before', position === 'before');
            (markEl as HTMLElement).classList.toggle('q-formfield__required-mark--after', position === 'after');
        }

        const separatorEl = this.getNodeEl('separator');
        if (separatorEl) {
            (separatorEl as HTMLElement).textContent = ui?.labelSeparator ?? '：';
        }
    }

    _shouldValidate(eventName: string): boolean {
        if (!this.validation) return false;
        if (eventName === this.validateTrigger) return true;
        if (this.validateTrigger === 'blur' && eventName === 'change') return false;
        return false;
    }

    async _doValidate(): Promise<void> {
        if (!this.validation) return;

        const rules = Array.isArray(this.validation) ? this.validation : [this.validation];
        const allErrors: any[] = [];

        for (const rule of rules) {
            if (typeof rule === 'boolean') continue;
            const errors = await doValidate.validate(this.getFormValue(), rule);
            if (errors) allErrors.push(...errors);
        }

        this.error = allErrors.length > 0 ? allErrors[0].message || String(allErrors[0]) : '';
    }

    addError(text: string): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.addError(text);
    }

    removeError(): void {
        const infoGroup = this.getComponent('infoGroup') as any;
        infoGroup?.removeError();
    }

    addHelp(text: string): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.addHelp(text);
    }

    removeHelp(): void {
        const infoGroup = this.getComponent('infoGroup') as any;
        infoGroup?.removeHelp();
    }

    addInfo(data: Record<string, any>): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.addInfo(data);
    }

    removeInfo(index: number): any {
        const infoGroup = this.getComponent('infoGroup') as any;
        return infoGroup?.removeInfo(index);
    }

    get error(): string {
        return this._error;
    }
    set error(v: string) {
        this._error = v;
        if (v) {
            this.addError(v);
            this.addCls('q-formfield--error');
        } else {
            this.removeError();
            this.removeCls('q-formfield--error');
        }
    }

    get field(): any {
        return this.getNode('field');
    }

    _applyState(): void {
        this.toggleCls('q-formfield--error', !!this._error);
    }

    getFormValue(): any {
        return undefined;
    }

    setFormValue(v: any): void {
        this._initialValue = v;
    }

    getFormDisplayValue(): any {
        return this.getFormValue();
    }

    getFormError(): string {
        return this._error ?? '';
    }

    formReset(defaultValue?: any): void {
        const v = defaultValue ?? this._initialValue;
        this.setFormValue(v);
        this.error = '';
    }
}

FormFieldComponent.use([SizeAbility]);
FormFieldComponent.define(FormFieldComponentDefs);

export { FormFieldComponent };
export type FormFieldComponentInstance = InstanceType<typeof FormFieldComponent>;
