import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { Definitions } from '@/composable';
import { FORMFIELD_TPL } from './formfield-tpl';
import './formfield.css';

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
        labelPosition: 'top',
        labelWidth: null,
        required: false,
        requiredMark: null,
        requiredMarkPosition: 'after',
        size: null,
        colSpan: 0,
        error: null,
        help: null,
        info: null,
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

    _initialValue: any = undefined;
    _infoItem: any = null;

    _onLabelOptionChange(value: string): void {
        if (value) {
            this.setNodeText(value, 'label');
            this.setNodeHidden(false, 'labelGroup');
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
        if (value && this.label) {
            this._applyRequiredConfig();
            this.setNodeHidden(false, 'requiredMark');
        } else {
            this.setNodeHidden(true, 'requiredMark');
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

    _onErrorOptionChange(value: string): void {
        if (value) {
            this.addError(value);
            this.addCls('q-formfield--error');
        } else {
            this.removeError();
            this.removeCls('q-formfield--error');
        }
    }

    _onHelpOptionChange(value: string): void {
        if (value) {
            this.addHelp(value);
        } else {
            this.removeHelp();
        }
    }

    _onInfoOptionChange(value: any): void {
        if (this._infoItem) {
            const infoGroup = this.getComponent('infoGroup') as any;
            if (infoGroup) {
                const idx = infoGroup.items?.indexOf(this._infoItem);
                if (idx != null && idx >= 0) infoGroup.removeAt(idx);
            }
            this._infoItem = null;
        }
        if (value) {
            const data = typeof value === 'string' ? { text: value } : value;
            this.addInfo(data);
            const infoGroup = this.getComponent('infoGroup') as any;
            this._infoItem = infoGroup?.items?.[infoGroup.items.length - 1] ?? null;
        }
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
            (markEl as HTMLElement).classList.toggle(
                'q-formfield__required-mark--before',
                position === 'before'
            );
            (markEl as HTMLElement).classList.toggle(
                'q-formfield__required-mark--after',
                position === 'after'
            );
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

    get field(): HTMLInputElement | undefined {
        return this.getComponent('fieldBody')?.getNodeEl('field') as HTMLInputElement | undefined;
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
        return this.getData('error') ?? '';
    }

    formReset(defaultValue?: any): void {
        const v = defaultValue ?? this._initialValue;
        this.setFormValue(v);
        this.error = '';
    }
}

FormFieldComponent.use(SizeAbility);
FormFieldComponent.define(FormFieldComponentDefs);

export { FormFieldComponent };
export type FormFieldComponentInstance = InstanceType<typeof FormFieldComponent>;
