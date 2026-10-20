import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
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

    /**
     * 全部 DOM 事件委托规则集中于此（子组件不再各自定义，子类不得再声明 domEvents 覆盖）：
     * 子类按需覆写 handler 方法（onFieldItemClick/onFieldKeydown 等），
     * 未实现的 handler 引擎静默跳过；每条规则同时转发对应组件事件。
     *
     * path 说明：
     *   fieldBody.[items] = fieldBody 内逐 item contains 匹配，item.action 经
     *     [action] 占位符转发（业务在 listens 监听对应 action 事件，或 handler 内分发）
     *   fieldBody.{input-field} = 输入框子组件 type 查找（无输入框的组件自动不匹配）
     */
    domEvents: DomEventsMap = {
        click: [
            {
                path: 'fieldBody.[items]',
                handler: 'onFieldItemClick',
                emits: ['[action]'],
                bridges: ['[action]'],
            },
        ],
        keydown: [{ path: 'fieldBody.{input-field}', handler: 'onFieldKeydown', emits: ['keydown'] }],
        input: [{ path: 'fieldBody.{input-field}', handler: 'onFieldInput', emits: ['input'] }],
        focus: [{ path: 'fieldBody.{input-field}', handler: 'onFieldFocus', emits: ['focus'] }],
        blur: [{ path: 'fieldBody.{input-field}', handler: 'onFieldBlur', emits: ['blur'] }],
        change: [{ path: 'fieldBody.{input-field}', handler: 'onFieldChange', emits: ['change'] }],
    };

    /** fieldBody 内 item 点击（子类覆写，按 domEvt.action 分发内部控件） */
    onFieldItemClick(_domEvt?: any): void {}

    /** 输入框 keydown（子类覆写） */
    onFieldKeydown(_domEvt?: any): void {}

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
