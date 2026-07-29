/**
 * CheckboxGroupComponent 复选框组组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过 nodeOverrides 指定 fieldBody 为 CheckboxGroupFieldBodyComponent。
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
import { CheckboxGroupFieldBodyComponent } from './CheckboxGroupFieldBodyComponent';
import type { ValidationRule } from '@qimenjs/schema';

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

export let CheckboxGroupComponent = FormFieldComponent.replace({
    body: {
        nodes: {
            root: { addCls: 'q-checkbox-group' },
            fieldBody: {
                type: CheckboxGroupFieldBodyComponent,
            },
        },

        _options: [] as CheckboxOption[],
        _value: [] as (string | number)[],
        _disabled: false,
        _checkboxItems: [] as any[],

        onAfterInit(props?: CheckboxGroupProps): void {
            const self = this as any;
            self._initCheckboxGroup(props);
        },

        _initCheckboxGroup(props?: CheckboxGroupProps): void {
            const self = this as any;
            self._options = props?.options ?? [];
            self._value = props?.value ? [...props.value] : [];

            if (props?.direction) {
                const optionsCmp = self.nodeMap?.options?.component;
                if (optionsCmp) {
                    optionsCmp.direction = props.direction;
                }
            }

            if (props?.disabled) self._disabled = props.disabled;

            self._renderOptions();
            self._applyState();
        },

        _renderOptions(): void {
            const self = this as any;
            const optionsCmp = self.nodeMap?.options?.component;
            if (!optionsCmp) return;

            optionsCmp.clear();
            self._checkboxItems = [];

            for (const opt of self._options) {
                const checked = self._value.includes(opt.value);
                const item = optionsCmp.add({
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
                            !!opt.disabled || self._disabled
                        );

                        const box = document.createElement('span');
                        box.className = 'q-checkbox-group__box';
                        if (checked) box.classList.add('q-checkbox-group__box--checked');
                        el.insertBefore(box, el.firstChild);

                        el.setAttribute('role', 'checkbox');
                        el.setAttribute('aria-checked', String(checked));

                        if (!opt.disabled && !self._disabled) {
                            el.style.cursor = 'pointer';
                            el.addEventListener('click', () => {
                                self._onCheckboxClick(opt.value);
                            });
                        }
                    }
                    self._checkboxItems.push({ item: itemObj, option: opt });
                }
            }
        },

        _onCheckboxClick(value: string | number): void {
            const self = this as any;
            const idx = self._value.indexOf(value);
            if (idx >= 0) {
                self._value.splice(idx, 1);
            } else {
                self._value.push(value);
            }
            self._updateCheckedState();
            self.emit('checkbox:change', { value: [...self._value] });
            if (self._shouldValidate('change')) self._doValidate();
        },

        _updateCheckedState(): void {
            const self = this as any;
            for (const { item, option } of self._checkboxItems) {
                const checked = self._value.includes(option.value);
                const el = item.el as HTMLElement;
                if (!el) continue;

                el.classList.toggle('q-checkbox-group__item--checked', checked);
                el.setAttribute('aria-checked', String(checked));

                const box = el.querySelector('.q-checkbox-group__box') as HTMLElement | null;
                if (box) {
                    box.classList.toggle('q-checkbox-group__box--checked', checked);
                }
            }
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: [...self._value] };
        },

        get value(): (string | number)[] {
            const self = this as any;
            return [...self._value];
        },
        set value(v: (string | number)[]) {
            const self = this as any;
            self._value = [...v];
            self._updateCheckedState();
        },

        get options(): CheckboxOption[] {
            const self = this as any;
            return self._options;
        },
        set options(v: CheckboxOption[]) {
            const self = this as any;
            self._options = v;
            self._renderOptions();
        },

        get disabled(): boolean {
            const self = this as any;
            return self._disabled;
        },
        set disabled(v: boolean) {
            const self = this as any;
            self._disabled = v;
            self.toggleCls('q-checkbox-group--disabled', v);
            self._renderOptions();
        },

        _applyState(): void {
            const self = this as any;
            self.toggleCls('q-checkbox-group--disabled', self._disabled);
            self.toggleCls('q-checkbox-group--error', !!self._error);
        },

        getFormValue(): any {
            const self = this as any;
            return [...self._value];
        },

        setFormValue(v: any): void {
            const self = this as any;
            self._value = Array.isArray(v) ? [...v] : [];
            self._updateCheckedState();
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self._value = Array.isArray(defaultValue) ? [...defaultValue] : [];
            self._updateCheckedState();
            self.error = '';
        },

        update(props?: Partial<CheckboxGroupProps>): void {
            const self = this as any;
            self._super.update(props);

            if (props?.options !== undefined) self.options = props.options;
            if (props?.value !== undefined) self.value = props.value;
            if (props?.direction !== undefined) {
                const optionsCmp = self.nodeMap?.options?.component;
                if (optionsCmp) optionsCmp.direction = props.direction;
            }
            if (props?.disabled !== undefined) self.disabled = props.disabled;
        },
    },
});

export type CheckboxGroupComponent = InstanceType<typeof CheckboxGroupComponent>;
