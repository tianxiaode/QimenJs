/**
 * InputComponent 输入框组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * fieldBody 子组件为 InputFieldBodyComponent（由 FormFieldComponent 模板默认提供）。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   输入封装：prefix + field + actions(ItemGroup) + suffix + dropdownIcon
 * - infoGroup   信息封装：InputInfoGroupComponent (error/help/扩展信息)
 *
 * Input 特有功能：
 * - value/disabled/readonly 属性
 * - clearable 清除按钮
 * - field 事件处理（input/focus/blur/change/keydown）
 * - actions 便捷方法
 *
 * 派生组件（PasswordInput/NumberInput/Select/DatePicker）通过 addAction/节点显隐扩展。
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

import { FormFieldComponent } from './FormFieldComponent';
import type { ValidationRule } from '@qimenjs/schema';
import { TextComponent } from '../text/TextComponent';
import './input.css.ts';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

export interface InputProps {
    value?: string;
    placeholder?: string;
    label?: string;
    labelPosition?: 'top' | 'left' | 'right';
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
    validateTrigger?: 'blur' | 'change' | 'input';
}

const CLEAR_BTN_ORDER = 0;

class InputComponent extends FormFieldComponent {
    _value: string = '';
    _focused: boolean = false;
    _clearable: boolean = false;
    _clearBtnItem: any = null;
    _offValidation: (() => void) | null = null;

    onAfterInit(props?: Record<string, any>): void {
        super.onAfterInit(props);
        this.addCls('q-input');
        this._initInput(props as InputProps);
    }

    onBeforeDispose(): void {
        if (this._offValidation) {
            this._offValidation();
            this._offValidation = null;
        }
        super.onBeforeDispose();
    }

    _initInput(props?: InputProps): void {
        const fieldEl = this.field;

        const fieldBodyCmp = this.nodeMap?.fieldBody?.component;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('actionClick', (data: any) => this.onFieldBodyActionClick(data));
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
        if (props?.type && fieldEl) {
            fieldEl.setAttribute('type', props.type);
        }
        if (props?.maxLength !== undefined && fieldEl) {
            fieldEl.setAttribute('maxlength', String(props.maxLength));
        }
        if (props?.disabled) this.disabled = true;
        if (props?.readonly) this.readonly = true;
        if (props?.clearable) {
            this._clearable = true;
            this.setNodeHidden(false, 'actions');
            this._initClearBtn();
            this._toggleClearBtn();
        }
        this._applyState();
    }

    onFieldBodyActionClick(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return;
        if (this._clearBtnItem && this._itemsIndexOf(actionsCmp, this._clearBtnItem) === index) {
            this.onClearBtnClick();
        }
    }

    _itemsIndexOf(group: any, item: any): number {
        for (let i = 0; i < group._items.length; i++) {
            if (group._items[i] === item) return i;
        }
        return -1;
    }

    _initClearBtn(): void {
        if (this._clearBtnItem) return;
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return;
        actionsCmp.add({
            type: TextComponent,
            cls: 'q-input__clear-btn',
            text: '×',
            order: CLEAR_BTN_ORDER,
        });
        this._clearBtnItem = actionsCmp._items[actionsCmp._items.length - 1] ?? null;
    }

    onClearBtnClick(): void {
        this.value = '';
        this.emit('input', { value: '' });
        this._toggleClearBtn();
        this.field?.focus();
    }

    _toggleClearBtn(): void {
        if (!this._clearable || !this._clearBtnItem) return;
        const hasValue = !!this._value;
        this._clearBtnItem.el.hidden = !hasValue;
    }

    onFieldInput(): void {
        this._value = this.field?.value ?? '';
        this._toggleClearBtn();
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

    addAction(data: Record<string, any>): any {
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return null;
        this.setNodeHidden(false, 'actions');
        return actionsCmp.add(data);
    }

    removeAction(index: number): any {
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return undefined;
        const result = actionsCmp.removeAt(index);
        if (actionsCmp.count === 0) this.setNodeHidden(true, 'actions');
        return result;
    }

    setActionHidden(index: number, hidden: boolean): void {
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return;
        const item = actionsCmp.getAt(index);
        if (item?.el) item.el.hidden = hidden;
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
        this._toggleClearBtn();
    }

    get disabled(): boolean {
        return this.el.classList.contains('q-input--disabled');
    }
    set disabled(v: boolean) {
        const fieldEl = this.field;
        if (fieldEl) {
            if (v) fieldEl.setAttribute('disabled', 'true');
            else fieldEl.removeAttribute('disabled');
        }
        this.toggleCls('q-input--disabled', v);
    }

    get readonly(): boolean {
        return this.el.classList.contains('q-input--readonly');
    }
    set readonly(v: boolean) {
        const fieldEl = this.field;
        if (fieldEl) {
            if (v) fieldEl.setAttribute('readonly', 'true');
            else fieldEl.removeAttribute('readonly');
        }
        this.toggleCls('q-input--readonly', v);
    }

    focus(): void {
        this.field?.focus();
    }

    blur(): void {
        this.field?.blur();
    }

    select(): void {
        this.field?.select();
    }

    _applyState(): void {
        this.toggleCls('q-input--focused', this._focused);
        this.toggleCls('q-input--error', !!this._error);
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

    update(props?: Record<string, any>): void {
        super.update(props);
        const inputProps = props as Partial<InputProps>;
        const fieldEl = this.field;

        if (inputProps?.value !== undefined) this.value = inputProps.value;
        if (inputProps?.placeholder !== undefined && fieldEl) {
            fieldEl.setAttribute('placeholder', inputProps.placeholder);
        }
        if (inputProps?.type !== undefined && fieldEl) {
            fieldEl.setAttribute('type', inputProps.type);
        }
        if (inputProps?.disabled !== undefined) this.disabled = inputProps.disabled;
        if (inputProps?.readonly !== undefined) this.readonly = inputProps.readonly;
        if (inputProps?.maxLength !== undefined && fieldEl) {
            fieldEl.setAttribute('maxlength', String(inputProps.maxLength));
        }
        if (inputProps?.clearable !== undefined) {
            this._clearable = inputProps.clearable;
            if (inputProps.clearable) {
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
    }
}

export { InputComponent };
export type InputComponentInstance = InstanceType<typeof InputComponent>;
