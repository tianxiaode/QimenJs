import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { Definitions } from '@/composable';
import { FORMFIELD_TPL } from './formfield-tpl';
import { InputFieldComponent } from './InputFieldComponent';
import { TextareaFieldComponent } from './TextareaFieldComponent';
import { IconComponent } from '../icon/IconComponent';
import { TextComponent } from '../text/TextComponent';
import type { PrefixSuffixDef, FieldType } from './types';
import {
    PREFIX_ORDER,
    FIELD_ITEM_ORDER,
    SUFFIX_ORDER,
    CLEAR_BTN_ORDER,
} from './constants';
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
        fieldType: 'input',
        prefix: null,
        suffix: null,
        clearable: false,
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
    _fieldItem: any = null;
    _prefixItem: any = null;
    _suffixItem: any = null;
    _clearBtnItem: any = null;

    createChildren(childReady?: () => void): void {
        super.createChildren(childReady);
        this._initFieldItem();
    }

    _getFieldBody(): any {
        return this.getComponent('fieldBody') as any;
    }

    _getFieldEl(): HTMLElement | undefined {
        return this._fieldItem?.el as HTMLElement | undefined;
    }

    _initFieldItem(): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp || this._fieldItem) return;

        const fieldType = this.getData('fieldType') as FieldType;
        if (fieldType === 'input') {
            fieldBodyCmp.addCls('q-input__wrapper');
            this._fieldItem = fieldBodyCmp.add({
                type: InputFieldComponent,
                order: FIELD_ITEM_ORDER,
            });
        } else if (fieldType === 'textarea') {
            fieldBodyCmp.addCls('q-textarea__wrapper');
            this._fieldItem = fieldBodyCmp.add({
                type: TextareaFieldComponent,
                order: FIELD_ITEM_ORDER,
            });
        }
    }

    _onPrefixOptionChange(value: PrefixSuffixDef | null): void {
        this._unmountPrefix();
        if (value) this._mountPrefix(value);
    }

    _onSuffixOptionChange(value: PrefixSuffixDef | null): void {
        this._unmountSuffix();
        if (value) this._mountSuffix(value);
    }

    _onClearableOptionChange(value: boolean): void {
        if (value) {
            this._initClearBtn();
            this._toggleClearBtn();
        } else {
            this._removeClearBtn();
        }
    }

    _mountPrefix(value: PrefixSuffixDef): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const isIcon = typeof value === 'object' && value !== null && 'iconCls' in value;
        const item = fieldBodyCmp.add({
            type: isIcon ? IconComponent : TextComponent,
            ...(isIcon ? { iconCls: value.iconCls } : { text: value as string }),
            order: PREFIX_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__prefix');
        }
        this._prefixItem = item;
    }

    _unmountPrefix(): void {
        if (!this._prefixItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._prefixItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._prefixItem = null;
    }

    _mountSuffix(value: PrefixSuffixDef): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const isIcon = typeof value === 'object' && value !== null && 'iconCls' in value;
        const item = fieldBodyCmp.add({
            type: isIcon ? IconComponent : TextComponent,
            ...(isIcon ? { iconCls: value.iconCls } : { text: value as string }),
            order: SUFFIX_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__suffix');
        }
        this._suffixItem = item;
    }

    _unmountSuffix(): void {
        if (!this._suffixItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._suffixItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._suffixItem = null;
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
        this._toggleClearBtn();
        this._fieldItem?.focus();
    }

    _toggleClearBtn(): void {
        if (!this._clearBtnItem) return;
        const hasValue = !!this._fieldItem?.value;
        this._clearBtnItem.el.classList.toggle('hidden', !hasValue);
    }

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

    get field(): HTMLElement | undefined {
        return this._fieldItem?.el as HTMLElement | undefined;
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
