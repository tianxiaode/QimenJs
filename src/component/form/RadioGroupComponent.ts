/**
 * RadioGroupComponent 单选框组组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过 nodeOverrides 指定 fieldBody 为 RadioGroupFieldBodyComponent。
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
import { RadioGroupFieldBodyComponent } from './RadioGroupFieldBodyComponent';
import type { ValidationRule } from '@qimenjs/schema';

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

export let RadioGroupComponent = FormFieldComponent.replace({
    body: {
        nodes: {
            root: { addCls: 'q-radio-group' },
            fieldBody: {
                type: RadioGroupFieldBodyComponent,
            },
        },

        _options: [] as RadioOption[],
        _value: undefined as string | number | undefined,
        _disabled: false,
        _radioItems: [] as any[],

        onAfterInit(props?: RadioGroupProps): void {
            const self = this as any;
            self._initRadioGroup(props);
        },

        _initRadioGroup(props?: RadioGroupProps): void {
            const self = this as any;
            self._options = props?.options ?? [];
            self._value = props?.value;

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
            self._radioItems = [];

            for (const opt of self._options) {
                const checked = self._value === opt.value;
                const item = optionsCmp.add({
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
                            !!opt.disabled || self._disabled
                        );

                        const dot = document.createElement('span');
                        dot.className = 'q-radio-group__dot';
                        if (checked) dot.classList.add('q-radio-group__dot--checked');
                        el.insertBefore(dot, el.firstChild);

                        el.setAttribute('role', 'radio');
                        el.setAttribute('aria-checked', String(checked));

                        if (!opt.disabled && !self._disabled) {
                            el.style.cursor = 'pointer';
                            el.addEventListener('click', () => {
                                self._onRadioClick(opt.value);
                            });
                        }
                    }
                    self._radioItems.push({ item: itemObj, option: opt });
                }
            }
        },

        _onRadioClick(value: string | number): void {
            const self = this as any;
            if (self._value === value) return;
            self._value = value;
            self._updateCheckedState();
            self.emit('radio:change', { value: self._value });
            if (self._shouldValidate('change')) self._doValidate();
        },

        _updateCheckedState(): void {
            const self = this as any;
            for (const { item, option } of self._radioItems) {
                const checked = self._value === option.value;
                const el = item.el as HTMLElement;
                if (!el) continue;

                el.classList.toggle('q-radio-group__item--checked', checked);
                el.setAttribute('aria-checked', String(checked));

                const dot = el.querySelector('.q-radio-group__dot') as HTMLElement | null;
                if (dot) {
                    dot.classList.toggle('q-radio-group__dot--checked', checked);
                }
            }
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        get value(): string | number | undefined {
            const self = this as any;
            return self._value;
        },
        set value(v: string | number | undefined) {
            const self = this as any;
            self._value = v;
            self._updateCheckedState();
        },

        get options(): RadioOption[] {
            const self = this as any;
            return self._options;
        },
        set options(v: RadioOption[]) {
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
            self.toggleCls('q-radio-group--disabled', v);
            self._renderOptions();
        },

        _applyState(): void {
            const self = this as any;
            self.toggleCls('q-radio-group--disabled', self._disabled);
            self.toggleCls('q-radio-group--error', !!self._error);
        },

        getFormValue(): any {
            const self = this as any;
            return self._value;
        },

        setFormValue(v: any): void {
            const self = this as any;
            self._value = v;
            self._updateCheckedState();
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self._value = defaultValue ?? undefined;
            self._updateCheckedState();
            self.error = '';
        },

        update(props?: Partial<RadioGroupProps>): void {
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

export type RadioGroupComponent = InstanceType<typeof RadioGroupComponent>;
