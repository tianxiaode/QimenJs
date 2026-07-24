/**
 * InputComponent 输入框组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过 nodeOverrides 指定 fieldBody 为 InputFieldBodyComponent。
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

import { FormFieldComponent } from './FormFieldComponent';
import { InputFieldBodyComponent } from './InputFieldBodyComponent';
import type { ValidationRule } from '@qimenjs/schema';
import { validate as doValidate } from '@qimenjs/validation';

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

function getFieldEl(cmp: any): HTMLInputElement | null {
    return cmp.nodeMap?.field?.el as HTMLInputElement | null;
}

const CLEAR_BTN_ORDER = 0;

export let InputComponent = FormFieldComponent.replace({
    type: 'Input',

    body: {
        nodes: {
            root: { addCls: 'q-input' },
            fieldBody: {
                type: InputFieldBodyComponent,
            },
        },
        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _value: '',
                _focused: false,
                _clearable: false,
                _clearBtnItem: null as any,
            };
        },

        onAfterInit(props?: InputProps): void {
            const self = this as any;
            self._initInput(props);
        },

        onBeforeDispose(): void {
            const self = this as any;
            if (self._offValidation) {
                self._offValidation();
                self._offValidation = null;
            }
        },

        _initInput(props?: InputProps): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            const fieldBodyCmp = self.nodeMap?.fieldBody?.component;
            if (fieldBodyCmp) {
                fieldBodyCmp.on('actionClick', (data: any) => self.onFieldBodyActionClick(data));
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
            if (props?.type && fieldEl) {
                fieldEl.setAttribute('type', props.type);
            }
            if (props?.maxLength !== undefined && fieldEl) {
                fieldEl.setAttribute('maxlength', String(props.maxLength));
            }
            if (props?.disabled) self.disabled = true;
            if (props?.readonly) self.readonly = true;
            if (props?.clearable) {
                self._clearable = true;
                self.setNodeHidden(false, 'actions');
                self._initClearBtn();
                self._toggleClearBtn();
            }
            self._applyState();
        },

        onFieldBodyActionClick(data: any): void {
            const self = this as any;
            const index = data?.index;
            if (index === undefined) return;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            if (
                self._clearBtnItem &&
                self._itemsIndexOf(actionsCmp, self._clearBtnItem) === index
            ) {
                self.onClearBtnClick();
            }
        },

        _itemsIndexOf(group: any, item: any): number {
            for (let i = 0; i < group._items.length; i++) {
                if (group._items[i] === item) return i;
            }
            return -1;
        },

        _initClearBtn(): void {
            const self = this as any;
            if (self._clearBtnItem) return;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            actionsCmp.add({
                type: 'Text',
                cls: 'q-input__clear-btn',
                text: '×',
                order: CLEAR_BTN_ORDER,
            });
            self._clearBtnItem = actionsCmp._items[actionsCmp._items.length - 1] ?? null;
        },

        onClearBtnClick(): void {
            const self = this as any;
            self.value = '';
            self.emit('input', { value: '' });
            self._toggleClearBtn();
            getFieldEl(self)?.focus();
        },

        _toggleClearBtn(): void {
            const self = this as any;
            if (!self._clearable || !self._clearBtnItem) return;
            const hasValue = !!self._value;
            self._clearBtnItem.el.hidden = !hasValue;
        },

        onFieldInput(): void {
            const self = this as any;
            self._value = self.field;
            self._toggleClearBtn();
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
            self._value = self.field;
            if (self._shouldValidate('change')) self._doValidate();
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        addAction(data: Record<string, any>): any {
            const self = this as any;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return null;
            self.setNodeHidden(false, 'actions');
            return actionsCmp.add(data);
        },

        removeAction(index: number): any {
            const self = this as any;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return undefined;
            const result = actionsCmp.removeAt(index);
            if (actionsCmp.count === 0) self.setNodeHidden(true, 'actions');
            return result;
        },

        setActionHidden(index: number, hidden: boolean): void {
            const self = this as any;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            const item = actionsCmp.getAt(index);
            if (item?.el) item.el.hidden = hidden;
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
            self._toggleClearBtn();
        },

        get disabled(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-input--disabled');
        },
        set disabled(v: boolean) {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (fieldEl) {
                if (v) fieldEl.setAttribute('disabled', 'true');
                else fieldEl.removeAttribute('disabled');
            }
            self.toggleCls('q-input--disabled', v);
        },

        get readonly(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-input--readonly');
        },
        set readonly(v: boolean) {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (fieldEl) {
                if (v) fieldEl.setAttribute('readonly', 'true');
                else fieldEl.removeAttribute('readonly');
            }
            self.toggleCls('q-input--readonly', v);
        },

        focus(): void {
            getFieldEl(this)?.focus();
        },

        blur(): void {
            getFieldEl(this)?.blur();
        },

        select(): void {
            getFieldEl(this)?.select();
        },

        _applyState(): void {
            const self = this as any;
            self.toggleCls('q-input--focused', self._focused);
            self.toggleCls('q-input--error', !!self._error);
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

        update(props?: Partial<InputProps>): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            self._super.update(props);

            if (props?.value !== undefined) self.value = props.value;
            if (props?.placeholder !== undefined && fieldEl) {
                fieldEl.setAttribute('placeholder', props.placeholder);
            }
            if (props?.type !== undefined && fieldEl) {
                fieldEl.setAttribute('type', props.type);
            }
            if (props?.disabled !== undefined) self.disabled = props.disabled;
            if (props?.readonly !== undefined) self.readonly = props.readonly;
            if (props?.maxLength !== undefined && fieldEl) {
                fieldEl.setAttribute('maxlength', String(props.maxLength));
            }
            if (props?.clearable !== undefined) {
                self._clearable = props.clearable;
                if (props.clearable) {
                    self.setNodeHidden(false, 'actions');
                    self._initClearBtn();
                    self._toggleClearBtn();
                } else {
                    if (self._clearBtnItem) {
                        self._clearBtnItem.el.hidden = true;
                    }
                    self.setNodeHidden(true, 'actions');
                }
            }
        },
    },
});

export type InputComponent = InstanceType<typeof InputComponent>;
