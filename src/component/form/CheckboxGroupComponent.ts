/**
 * CheckboxGroupComponent 复选框组组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * fieldBody 子组件为 CheckboxGroupFieldBodyComponent（由 CHECKBOX_GROUP_TPL 指定）。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   复选框组封装：ItemGroupStatic 管理选项
 * - infoGroup   信息封装：InputInfoGroupComponent
 *
 * CheckboxGroup 特有功能：
 * - options 选项列表
 * - value 已选值数组
 * - direction 排列方向（vertical/horizontal）
 * - disabled 全部禁用
 *
 * 事件：checkbox:change。
 *
 * @example
 * ```ts
 * new CheckboxGroupComponent({
 *     options: [
 *         { label: '选项1', value: '1' },
 *         { label: '选项2', value: '2' },
 *     ],
 *     value: ['1'],
 * })
 * group.on('checkbox:change', ({ value }) => { ... })
 * ```
 */

import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import { CHECKBOX_GROUP_TPL } from './checkbox-group-tpl';
import './checkboxgroup.css.ts';

export interface CheckboxOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface CheckboxGroupProps extends FormFieldProps {
    options?: CheckboxOption[];
    value?: (string | number)[];
    direction?: 'vertical' | 'horizontal';
    disabled?: boolean;
}

class CheckboxGroupComponent extends FormFieldComponent {
    _options: CheckboxOption[] = [];
    _value: (string | number)[] = [];
    _disabled: boolean = false;
    _checkboxItems: any[] = [];

    onAfterInit(props?: CheckboxGroupProps): void {
        super.onAfterInit(props);
        this.addCls('q-checkbox-group');
        this._initCheckboxGroup(props);
    }

    _initCheckboxGroup(props?: CheckboxGroupProps): void {
        this._options = props?.options ?? [];
        this._value = props?.value ? [...props.value] : [];

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
        this._checkboxItems = [];

        for (const opt of this._options) {
            const checked = this._value.includes(opt.value);
            optionsCmp.add({
                type: 'Text',
                cls: 'q-checkbox-group__item',
                text: opt.label,
                order: 0,
            });
            const itemObj = optionsCmp._items[optionsCmp._items.length - 1];
            if (itemObj) {
                const el = itemObj.el as HTMLElement;
                if (el) {
                    el.classList.toggle('q-checkbox-group__item--checked', checked);
                    el.classList.toggle(
                        'q-checkbox-group__item--disabled',
                        !!opt.disabled || this._disabled
                    );

                    const box = document.createElement('span');
                    box.className = 'q-checkbox-group__box';
                    if (checked) box.classList.add('q-checkbox-group__box--checked');
                    el.insertBefore(box, el.firstChild);

                    el.setAttribute('role', 'checkbox');
                    el.setAttribute('aria-checked', String(checked));

                    if (!opt.disabled && !this._disabled) {
                        el.style.cursor = 'pointer';
                        el.addEventListener('click', () => {
                            this._onCheckboxClick(opt.value);
                        });
                    }
                }
                this._checkboxItems.push({ item: itemObj, option: opt });
            }
        }
    }

    _onCheckboxClick(value: string | number): void {
        const idx = this._value.indexOf(value);
        if (idx >= 0) {
            this._value.splice(idx, 1);
        } else {
            this._value.push(value);
        }
        this._updateCheckedState();
        this.emit('checkbox:change', { value: [...this._value] });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateCheckedState(): void {
        for (const { item, option } of this._checkboxItems) {
            const checked = this._value.includes(option.value);
            const el = item.el as HTMLElement;
            if (!el) continue;

            el.classList.toggle('q-checkbox-group__item--checked', checked);
            el.setAttribute('aria-checked', String(checked));

            const box = el.querySelector('.q-checkbox-group__box') as HTMLElement | null;
            if (box) {
                box.classList.toggle('q-checkbox-group__box--checked', checked);
            }
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: [...this._value] };
    }

    get value(): (string | number)[] {
        return [...this._value];
    }
    set value(v: (string | number)[]) {
        this._value = [...v];
        this._updateCheckedState();
    }

    get options(): CheckboxOption[] {
        return this._options;
    }
    set options(v: CheckboxOption[]) {
        this._options = v;
        this._renderOptions();
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this.toggleCls('q-checkbox-group--disabled', v);
        this._renderOptions();
    }

    _applyState(): void {
        this.toggleCls('q-checkbox-group--disabled', this._disabled);
        this.toggleCls('q-checkbox-group--error', !!this._error);
    }

    getFormValue(): any {
        return [...this._value];
    }

    setFormValue(v: any): void {
        this._value = Array.isArray(v) ? [...v] : [];
        this._updateCheckedState();
    }

    formReset(defaultValue?: any): void {
        this._value = Array.isArray(defaultValue) ? [...defaultValue] : [];
        this._updateCheckedState();
        this.error = '';
    }

    update(props?: Partial<CheckboxGroupProps>): void {
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

CheckboxGroupComponent.useTemplate(CHECKBOX_GROUP_TPL);
export { CheckboxGroupComponent };
export type CheckboxGroupComponentInstance = InstanceType<typeof CheckboxGroupComponent>;
