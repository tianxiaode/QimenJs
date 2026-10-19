import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { Definitions } from '@/composable';
import { FORMFIELD_TPL } from './formfield-tpl';
import { FORMFIELD_ABILITIES } from './abilities';
import './formfield.css';

export type LabelPosition = 'top' | 'left' | 'right';
export type ValidateTrigger = 'blur' | 'change' | 'input';

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

    // declare 声明：初始化流程（createChildren → _initFieldItem 等）在基类构造链内
    // 同步执行，若用类字段初始化会在 super() 返回后覆盖已赋值（类字段时序陷阱）
    declare _initialValue: any;
    declare _infoItem: any;
    declare _fieldItem: any;
    declare _prefixItem: any;
    declare _suffixItem: any;
    declare _clearBtnItem: any;

    createChildren(childReady?: () => void): void {
        super.createChildren(childReady);
        this._initFieldItem();
    }

    _onColSpanOptionChange(value: number): void {
        this.el!.style.gridColumn = value > 1 ? `span ${value}` : '';
    }

    onAfterInit(): void {
        this._applyRequiredConfig();
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
        this.setData('error', '');
    }
}

FormFieldComponent.use(SizeAbility);
FormFieldComponent.use(FORMFIELD_ABILITIES);
FormFieldComponent.define(FormFieldComponentDefs);

export { FormFieldComponent };
export type FormFieldComponentInstance = InstanceType<typeof FormFieldComponent>;
