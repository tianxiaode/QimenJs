/**
 * RadioGroupComponent 单选框组组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * fieldBody 子组件为 RadioGroupFieldBodyComponent（由 RADIO_GROUP_TPL 指定）。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   单选框组封装：ItemGroupStatic 管理选项
 * - infoGroup   信息封装：InputInfoGroupComponent
 *
 * RadioGroup 特有功能：
 * - options 选项列表
 * - value 当前选中值
 * - direction 排列方向（vertical/horizontal）
 * - disabled 全部禁用
 *
 * 事件：radio:change。
 *
 * @example
 * ```ts
 * new RadioGroupComponent({
 *     options: [
 *         { label: '选项1', value: '1' },
 *         { label: '选项2', value: '2' },
 *     ],
 *     value: '1',
 * })
 * group.on('radio:change', ({ value }) => { ... })
 * ```
 */

import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import { RADIO_GROUP_TPL } from './radio-group-tpl';
import './radiogroup.css.ts';

export interface RadioOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface RadioGroupProps extends FormFieldProps {
    options?: RadioOption[];
    value?: string | number;
    direction?: 'vertical' | 'horizontal';
    disabled?: boolean;
}

class RadioGroupComponent extends FormFieldComponent {
    _options: RadioOption[] = [];
    _value: string | number | undefined = undefined;
    _disabled: boolean = false;
    _radioItems: any[] = [];

    onAfterInit(props?: RadioGroupProps): void {
        super.onAfterInit(props);
        this.addCls('q-radio-group');
        this._initRadioGroup(props);
    }

    _initRadioGroup(props?: RadioGroupProps): void {
        this._options = props?.options ?? [];
        this._value = props?.value;

        if (props?.direction) {
            const optionsCmp = this.nodeMap?.options?.component;
            if (optionsCmp) {
                optionsCmp.direction = props.direction;
            }
        }

        if (props?.disabled) this._disabled = props.disabled;

        this._renderOptions();
        this._applyState();
    }

    _renderOptions(): void {
        const optionsCmp = this.nodeMap?.options?.component;
        if (!optionsCmp) return;

        optionsCmp.clear();
        this._radioItems = [];

        for (const opt of this._options) {
            const checked = this._value === opt.value;
            optionsCmp.add({
                type: 'Text',
                cls: 'q-radio-group__item',
                text: opt.label,
                order: 0,
            });
            const itemObj = optionsCmp._items[optionsCmp._items.length - 1];
            if (itemObj) {
                const el = itemObj.el as HTMLElement;
                if (el) {
                    el.classList.toggle('q-radio-group__item--checked', checked);
                    el.classList.toggle(
                        'q-radio-group__item--disabled',
                        !!opt.disabled || this._disabled
                    );

                    const dot = document.createElement('span');
                    dot.className = 'q-radio-group__dot';
                    if (checked) dot.classList.add('q-radio-group__dot--checked');
                    el.insertBefore(dot, el.firstChild);

                    el.setAttribute('role', 'radio');
                    el.setAttribute('aria-checked', String(checked));

                    if (!opt.disabled && !this._disabled) {
                        el.style.cursor = 'pointer';
                        el.addEventListener('click', () => {
                            this._onRadioClick(opt.value);
                        });
                    }
                }
                this._radioItems.push({ item: itemObj, option: opt });
            }
        }
    }

    _onRadioClick(value: string | number): void {
        if (this._value === value) return;
        this._value = value;
        this._updateCheckedState();
        this.emit('radio:change', { value: this._value });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateCheckedState(): void {
        for (const { item, option } of this._radioItems) {
            const checked = this._value === option.value;
            const el = item.el as HTMLElement;
            if (!el) continue;

            el.classList.toggle('q-radio-group__item--checked', checked);
            el.setAttribute('aria-checked', String(checked));

            const dot = el.querySelector('.q-radio-group__dot') as HTMLElement | null;
            if (dot) {
                dot.classList.toggle('q-radio-group__dot--checked', checked);
            }
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    get value(): string | number | undefined {
        return this._value;
    }
    set value(v: string | number | undefined) {
        this._value = v;
        this._updateCheckedState();
    }

    get options(): RadioOption[] {
        return this._options;
    }
    set options(v: RadioOption[]) {
        this._options = v;
        this._renderOptions();
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this.toggleCls('q-radio-group--disabled', v);
        this._renderOptions();
    }

    _applyState(): void {
        this.toggleCls('q-radio-group--disabled', this._disabled);
        this.toggleCls('q-radio-group--error', !!this._error);
    }

    getFormValue(): any {
        return this._value;
    }

    setFormValue(v: any): void {
        this._value = v;
        this._updateCheckedState();
    }

    formReset(defaultValue?: any): void {
        this._value = defaultValue ?? undefined;
        this._updateCheckedState();
        this.error = '';
    }

    update(props?: Partial<RadioGroupProps>): void {
        super.update(props);

        if (props?.options !== undefined) this.options = props.options;
        if (props?.value !== undefined) this.value = props.value;
        if (props?.direction !== undefined) {
            const optionsCmp = this.nodeMap?.options?.component;
            if (optionsCmp) optionsCmp.direction = props.direction;
        }
        if (props?.disabled !== undefined) this.disabled = props.disabled;
    }
}

RadioGroupComponent.useTemplate(RADIO_GROUP_TPL);
export { RadioGroupComponent };
export type RadioGroupComponentInstance = InstanceType<typeof RadioGroupComponent>;
