/**
 * InputComponent 输入框组件
 *
 * 统一模板 + CSS 变量驱动布局，i18n 切换时无需重建 DOM。
 * 三封装结构：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - wrapper     输入封装：prefix + field + actions(ItemGroup) + suffix + dropdownIcon
 * - infoGroup   信息封装：InputInfoGroupComponent (error/help/扩展信息)
 *
 * 标签位置（top/left/right）通过 CSS 变量 --q-input-direction / --q-input-label-order 控制，
 * i18n 切换时只需更新 CSS 变量即可调整布局。
 *
 * 可替换节点：
 * - prefix        前缀区域（字符如 ¥/$ 或 CSS 图标）
 * - actions       操作按钮区域（ItemGroupStaticComponent，clearBtn/eyeBtn 等）
 * - suffix        右侧装饰区域（密码眼睛图标、搜索图标等）
 * - dropdownIcon  下拉箭头图标区域
 * - infoGroup     信息区域（InputInfoGroupComponent，error/help/扩展信息）
 *
 * 便捷方法：
 * - addAction(data) / removeAction(index) / setActionHidden(index, hidden)
 * - addError(text) / removeError() / addHelp(text) / removeHelp()
 * - addInfo(data) / removeInfo(index)
 *
 * 派生组件通过 replace() 实现：
 * - PasswordInputComponent: nodeOverrides 开启 suffix，addAction 添加 eyeBtn
 * - 下拉选择组件: nodeOverrides 开启 dropdownIcon + addAction 添加下拉图标
 *
 * 事件：input / focus / blur / change / keydown / clear。
 *
 * @example
 * ```ts
 * new InputComponent({ value: 'hello', placeholder: '请输入' })
 * new InputComponent({ label: '用户名', labelPosition: 'left', required: true })
 * input.on('input', ({ value }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

import { getI18nManager } from '@qimenjs/i18n';
import type { ValidationRule } from '@qimenjs/schema';
import { validate as doValidate } from '@qimenjs/validation';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
export type LabelPosition = 'top' | 'left' | 'right';
export type ValidateTrigger = 'blur' | 'change' | 'input';

export interface InputProps {
    value?: string;
    placeholder?: string;
    label?: string;
    labelPosition?: LabelPosition;
    type?: InputType;
    disabled?: boolean;
    readonly?: boolean;
    maxLength?: number;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    clearable?: boolean;
    requiredMark?: string;
    requiredMarkPosition?: 'before' | 'after';
    fieldName?: string;
    validation?: boolean | ValidationRule | ValidationRule[];
    validateTrigger?: ValidateTrigger;
}

function getFieldEl(cmp: any): HTMLInputElement | null {
    return cmp.nodeMap?.field?.el as HTMLInputElement | null;
}

function getI18nUiConfig(): {
    requiredMark: string;
    requiredMarkPosition: 'before' | 'after';
    labelSeparator: string;
} {
    const i18n = getI18nManager();
    if (!i18n) {
        return { requiredMark: '*', requiredMarkPosition: 'after', labelSeparator: '：' };
    }
    const config = i18n.getLocaleConfig();
    const ui = config?.ui;
    return {
        requiredMark: ui?.requiredMark ?? '*',
        requiredMarkPosition: ui?.requiredMarkPosition ?? 'after',
        labelSeparator: ui?.labelSeparator ?? '：',
    };
}

const LABEL_POSITION_MAP: Record<LabelPosition, string> = {
    top: 'q-input--top',
    left: 'q-input--left',
    right: 'q-input--right',
};

const CLEAR_BTN_ORDER = 0;

export let InputComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-input',
        children: [
            {
                tag: 'div',
                name: 'labelGroup',
                cls: 'q-input__label-group',
                hidden: true,
                children: [
                    { tag: 'label', name: 'label', cls: 'q-input__label' },
                    {
                        tag: 'span',
                        name: 'requiredMark',
                        cls: 'q-input__required-mark',
                        hidden: true,
                    },
                    { tag: 'span', name: 'separator', cls: 'q-input__separator' },
                ],
            },
            {
                tag: 'div',
                cls: 'q-input__wrapper',
                children: [
                    {
                        tag: 'span',
                        name: 'prefix',
                        cls: 'q-input__prefix',
                        hidden: true,
                    },
                    {
                        tag: 'input',
                        name: 'field',
                        cls: 'q-input__field',
                        events: {
                            input: { handler: true, emits: ['input'], debounce: 150 },
                            focus: { handler: true, emits: ['focus'] },
                            blur: { handler: true, emits: ['blur'] },
                            change: { handler: true, emits: ['change'], debounce: 150 },
                            keydown: { handler: true, emits: ['keydown'] },
                        },
                    },
                    {
                        name: 'actions',
                        type: 'ItemGroupStatic',
                        cls: 'q-input__actions',
                        hidden: true,
                        initConfig: {
                            direction: 'horizontal',
                            gap: '4px',
                            defaultItem: {
                                Icon: { events: { click: { bridges: ['actionClick'] } } },
                                Text: { events: { click: { bridges: ['actionClick'] } } },
                            },
                        },
                    },
                    {
                        tag: 'div',
                        name: 'suffix',
                        cls: 'q-input__slot q-input__slot--suffix',
                        hidden: true,
                    },
                    {
                        tag: 'div',
                        name: 'dropdownIcon',
                        cls: 'q-input__slot q-input__slot--dropdown',
                        hidden: true,
                    },
                ],
            },
            {
                name: 'infoGroup',
                type: 'InputInfoGroup',
            },
        ],
    },
    body: {
        type: 'Input',

        onInitState() {
            return {
                _value: '',
                _focused: false,
                _error: '',
                _clearable: false,
                _required: false,
                _requiredMark: '',
                _requiredMarkPosition: 'after' as 'before' | 'after',
                _labelText: '',
                _unsubscribeLocale: null as (() => void) | null,
                _fieldName: '' as string,
                _validation: null as boolean | ValidationRule | ValidationRule[] | null,
                _validateTrigger: 'blur' as ValidateTrigger,
                _offValidation: null as (() => void) | null,
                _clearBtnItem: null as any,
            };
        },

        onAfterInit(props?: InputProps): void {
            this._applyLabelPosition(props?.labelPosition);
            this.initSize();
            this._initInput(props);
            this._initI18n();
            this._initValidation(props);
            this._initActionEvents();
        },

        onBeforeDispose(): void {
            if (this._unsubscribeLocale) {
                this._unsubscribeLocale();
                this._unsubscribeLocale = null;
            }
            if (this._offValidation) {
                this._offValidation();
                this._offValidation = null;
            }
        },

        _applyLabelPosition(position?: LabelPosition): void {
            const pos = position || 'top';
            const cls = LABEL_POSITION_MAP[pos];
            if (cls) this.toggleCls(cls, true);
        },

        _initI18n(): void {
            const i18n = getI18nManager();
            if (!i18n) return;
            this._unsubscribeLocale = i18n.onLocaleChange(() => {
                this._applyRequiredConfig();
            });
        },

        _applyRequiredConfig(): void {
            const config = getI18nUiConfig();
            const mark = this._requiredMark || config.requiredMark;
            const position = this._requiredMarkPosition || config.requiredMarkPosition;

            const markEl = this.nodeMap?.requiredMark?.el as HTMLElement | null;
            if (markEl) {
                markEl.textContent = mark;
                markEl.classList.toggle('q-input__required-mark--before', position === 'before');
                markEl.classList.toggle('q-input__required-mark--after', position === 'after');
            }

            const separatorEl = this.nodeMap?.separator?.el as HTMLElement | null;
            if (separatorEl) {
                separatorEl.textContent = config.labelSeparator ?? '';
            }
        },

        _initInput(props?: InputProps): void {
            const fieldEl = getFieldEl(this);

            const config = getI18nUiConfig();
            this._requiredMark = props?.requiredMark ?? config.requiredMark;
            this._requiredMarkPosition = props?.requiredMarkPosition ?? config.requiredMarkPosition;

            if (props?.label) {
                this._labelText = props.label;
                this.setNodeHidden(false, 'labelGroup');
                this.label = props.label;
                this._applyRequiredConfig();
                if (this._required) {
                    this.setNodeHidden(false, 'requiredMark');
                }
            }
            if (props?.value !== undefined) {
                this._value = props.value;
                if (fieldEl) fieldEl.value = props.value;
            }
            if (props?.placeholder && fieldEl) {
                fieldEl.setAttribute('placeholder', props.placeholder);
            }
            if (props?.type && fieldEl) {
                fieldEl.setAttribute('type', props.type);
            }
            if (props?.maxLength !== undefined && fieldEl) {
                fieldEl.setAttribute('maxlength', String(props.maxLength));
            }
            if (props?.disabled) this.disabled = true;
            if (props?.readonly) this.readonly = true;
            if (props?.required) {
                this._required = true;
                if (fieldEl) fieldEl.setAttribute('required', 'true');
                this._applyRequiredConfig();
                if (this._labelText) {
                    this.setNodeHidden(false, 'requiredMark');
                }
            }
            if (props?.size) this.size = props.size;
            if (props?.clearable) {
                this._clearable = true;
                this.setNodeHidden(false, 'actions');
                this._initClearBtn();
                this._toggleClearBtn();
            }
            this._applyState();
        },

        _initValidation(props?: InputProps): void {
            if (props?.fieldName) this._fieldName = props.fieldName;
            if (props?.validation !== undefined) this._validation = props.validation;
            if (props?.validateTrigger) this._validateTrigger = props.validateTrigger;

            if (this._validation === true) {
                this.on('validation', this._onValidationResult);
            }
        },

        _initActionEvents(): void {
            const actionsCmp = this.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            actionsCmp.on('actionClick', (data: any) => {
                const index = data?.index;
                if (index === undefined) return;
                if (
                    this._clearBtnItem &&
                    this._itemsIndexOf(actionsCmp, this._clearBtnItem) === index
                ) {
                    this.onClearBtnClick();
                }
            });
        },

        _itemsIndexOf(group: any, item: any): number {
            for (let i = 0; i < group._items.length; i++) {
                if (group._items[i] === item) return i;
            }
            return -1;
        },

        _shouldValidate(eventName: string): boolean {
            if (!this._validation) return false;
            if (eventName === this._validateTrigger) return true;
            if (this._validateTrigger === 'blur' && eventName === 'change') return false;
            return false;
        },

        async _doValidate(): Promise<void> {
            if (!this._validation || this._validation === true) {
                this.emit('validate', { fieldName: this._fieldName, value: this._value });
                return;
            }

            const rules = Array.isArray(this._validation) ? this._validation : [this._validation];
            const allErrors: any[] = [];

            for (const rule of rules) {
                const errors = await doValidate.validate(this._value, rule);
                if (errors) allErrors.push(...errors);
            }

            this.error = allErrors.length > 0 ? allErrors[0].message || String(allErrors[0]) : '';
            this.emit('validation', {
                fieldName: this._fieldName,
                isValid: allErrors.length === 0,
                errors: allErrors,
            });
        },

        _onValidationResult(data: any): void {
            if (data.fieldName && data.fieldName !== this._fieldName) return;
            this.error = data.errors?.[0]?.message || '';
        },

        _initClearBtn(): void {
            if (this._clearBtnItem) return;
            const actionsCmp = this.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            actionsCmp.add({
                type: 'Text',
                cls: 'q-input__clear-btn',
                text: '×',
                order: CLEAR_BTN_ORDER,
            });
            this._clearBtnItem = actionsCmp._items[actionsCmp._items.length - 1] ?? null;
        },

        onClearBtnClick(): void {
            this.value = '';
            this.emit('input', { value: '' });
            this._toggleClearBtn();
            getFieldEl(this)?.focus();
        },

        _toggleClearBtn(): void {
            if (!this._clearable || !this._clearBtnItem) return;
            const hasValue = !!this._value;
            this._clearBtnItem.el.hidden = !hasValue;
        },

        onFieldInput(): void {
            this._value = this.field;
            this._toggleClearBtn();
            if (this._shouldValidate('input')) this._doValidate();
        },

        onFieldFocus(): void {
            this._focused = true;
            this._applyState();
        },

        onFieldBlur(): void {
            this._focused = false;
            this._applyState();
            if (this._shouldValidate('blur')) this._doValidate();
        },

        onFieldChange(): void {
            this._value = this.field;
            if (this._shouldValidate('change')) this._doValidate();
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            return { value: this._value };
        },

        // ========== actions 便捷方法 ==========

        addAction(data: Record<string, any>): any {
            const actionsCmp = this.nodeMap?.actions?.component;
            if (!actionsCmp) return null;
            this.setNodeHidden(false, 'actions');
            return actionsCmp.add(data);
        },

        removeAction(index: number): any {
            const actionsCmp = this.nodeMap?.actions?.component;
            if (!actionsCmp) return undefined;
            const result = actionsCmp.removeAt(index);
            if (actionsCmp.count === 0) this.setNodeHidden(true, 'actions');
            return result;
        },

        setActionHidden(index: number, hidden: boolean): void {
            const actionsCmp = this.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            const item = actionsCmp.getAt(index);
            if (item?.el) item.el.hidden = hidden;
        },

        // ========== infoGroup 便捷方法 ==========

        addError(text: string): any {
            return this.nodeMap?.infoGroup?.component?.addError(text);
        },

        removeError(): void {
            this.nodeMap?.infoGroup?.component?.removeError();
        },

        addHelp(text: string): any {
            return this.nodeMap?.infoGroup?.component?.addHelp(text);
        },

        removeHelp(): void {
            this.nodeMap?.infoGroup?.component?.removeHelp();
        },

        addInfo(data: Record<string, any>): any {
            return this.nodeMap?.infoGroup?.component?.addInfo(data);
        },

        removeInfo(index: number): any {
            return this.nodeMap?.infoGroup?.component?.removeInfo(index);
        },

        // ========== 属性 ==========

        get value(): string {
            return this._value;
        },
        set value(v: string) {
            this._value = v;
            const fieldEl = getFieldEl(this);
            if (fieldEl && fieldEl.value !== v) {
                fieldEl.value = v;
            }
            this._toggleClearBtn();
        },

        get disabled(): boolean {
            return this.el.classList.contains('q-input--disabled');
        },
        set disabled(v: boolean) {
            const fieldEl = getFieldEl(this);
            if (fieldEl) {
                if (v) fieldEl.setAttribute('disabled', 'true');
                else fieldEl.removeAttribute('disabled');
            }
            this.toggleCls('q-input--disabled', v);
        },

        get readonly(): boolean {
            return this.el.classList.contains('q-input--readonly');
        },
        set readonly(v: boolean) {
            const fieldEl = getFieldEl(this);
            if (fieldEl) {
                if (v) fieldEl.setAttribute('readonly', 'true');
                else fieldEl.removeAttribute('readonly');
            }
            this.toggleCls('q-input--readonly', v);
        },

        get error(): string {
            return this._error;
        },
        set error(v: string) {
            this._error = v;
            const infoCmp = this.nodeMap?.infoGroup?.component;
            if (v) {
                infoCmp?.addError(v);
                this.toggleCls('q-input--error', true);
            } else {
                infoCmp?.removeError();
                this.toggleCls('q-input--error', false);
            }
        },

        focus(): void {
            const fieldEl = getFieldEl(this);
            fieldEl?.focus();
        },

        blur(): void {
            const fieldEl = getFieldEl(this);
            fieldEl?.blur();
        },

        select(): void {
            const fieldEl = getFieldEl(this);
            fieldEl?.select();
        },

        _applyState(): void {
            this.toggleCls('q-input--focused', this._focused);
            this.toggleCls('q-input--error', !!this._error);
        },

        // ========== 表单值接口（供 FormComponent 收集） ==========

        getFormValue(): any {
            return this._value;
        },

        setFormValue(v: any): void {
            this.value = v;
        },

        getFormDisplayValue(): any {
            return this._value;
        },

        getFormError(): string {
            return this._error ?? '';
        },

        setFormError(v: string): void {
            this.error = v;
        },

        formReset(defaultValue?: any): void {
            this.value = defaultValue ?? '';
            this.error = '';
        },

        update(props?: Partial<InputProps>): void {
            const fieldEl = getFieldEl(this);

            if (props?.value !== undefined) this.value = props.value;
            if (props?.placeholder !== undefined && fieldEl) {
                fieldEl.setAttribute('placeholder', props.placeholder);
            }
            if (props?.label !== undefined) {
                this._labelText = props.label || '';
                if (props.label) {
                    this.setNodeHidden(false, 'labelGroup');
                    this.label = props.label;
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
            if (props?.type !== undefined && fieldEl) {
                fieldEl.setAttribute('type', props.type);
            }
            if (props?.disabled !== undefined) this.disabled = props.disabled;
            if (props?.readonly !== undefined) this.readonly = props.readonly;
            if (props?.maxLength !== undefined && fieldEl) {
                fieldEl.setAttribute('maxlength', String(props.maxLength));
            }
            if (props?.required !== undefined) {
                this._required = props.required;
                if (fieldEl) {
                    if (props.required) fieldEl.setAttribute('required', 'true');
                    else fieldEl.removeAttribute('required');
                }
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
            if (props?.clearable !== undefined) {
                this._clearable = props.clearable;
                if (props.clearable) {
                    this.setNodeHidden(false, 'actions');
                    this._initClearBtn();
                    this._toggleClearBtn();
                } else {
                    if (this._clearBtnItem) {
                        this._clearBtnItem.el.hidden = true;
                    }
                    this.setNodeHidden(true, 'actions');
                }
            }
            if (props?.fieldName !== undefined) this._fieldName = props.fieldName;
            if (props?.validation !== undefined) {
                if (this._offValidation) {
                    this._offValidation();
                    this._offValidation = null;
                }
                this._validation = props.validation;
                if (this._validation === true) {
                    this.on('validation', this._onValidationResult);
                }
            }
            if (props?.validateTrigger !== undefined) this._validateTrigger = props.validateTrigger;
        },
    },
}).with([SizeAbility]);

export type InputComponent = InstanceType<typeof InputComponent>;
