/**
 * SliderComponent 滑动条组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * fieldBody 子组件为 SliderFieldBodyComponent。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   滑动条封装：track + fill + thumb + valueLabel
 * - infoGroup   信息封装：InputInfoGroupComponent
 *
 * Slider 特有功能：
 * - value/min/max/step 数值约束
 * - showValue 是否显示当前值
 * - disabled 禁用状态
 * - 拖拽交互（pointer events）
 *
 * 事件：slider:change。
 *
 * @example
 * ```ts
 * new SliderComponent({ value: 30, min: 0, max: 100, step: 5, label: '音量' })
 * slider.on('slider:change', ({ value }) => { ... })
 * ```
 */

import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import { SliderFieldBodyComponent } from './SliderFieldBodyComponent';
import './slider.css.ts';

export interface SliderProps extends FormFieldProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    disabled?: boolean;
}

class SliderComponent extends FormFieldComponent {
    _value: number = 0;
    _min: number = 0;
    _max: number = 100;
    _step: number = 1;

    onAfterInit(props?: SliderProps): void {
        super.onAfterInit(props);
        this.addCls('q-slider');

        const fieldBodyCmp = this.nodeMap?.fieldBody?.component;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('sliderChange', (data: any) => {
                this._value = data.value;
                this.emit('slider:change', { value: this._value });
                if (this._shouldValidate('change')) this._doValidate();
            });
        }

        this._min = props?.min ?? 0;
        this._max = props?.max ?? 100;
        this._step = props?.step ?? 1;
        this._value = props?.value ?? this._min;

        if (props?.showValue === false) {
            const bodyCmp = this.nodeMap?.fieldBody?.component;
            if (bodyCmp) bodyCmp.update({ showValue: false });
        }
        if (props?.disabled) this.disabled = props.disabled;
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    get value(): number {
        return this._value;
    }
    set value(v: number) {
        this._value = v;
        const bodyCmp = this.nodeMap?.fieldBody?.component;
        if (bodyCmp) bodyCmp.update({ value: v });
    }

    get min(): number {
        return this._min;
    }
    set min(v: number) {
        this._min = v;
        const bodyCmp = this.nodeMap?.fieldBody?.component;
        if (bodyCmp) bodyCmp.update({ min: v });
    }

    get max(): number {
        return this._max;
    }
    set max(v: number) {
        this._max = v;
        const bodyCmp = this.nodeMap?.fieldBody?.component;
        if (bodyCmp) bodyCmp.update({ max: v });
    }

    get step(): number {
        return this._step;
    }
    set step(v: number) {
        this._step = v;
        const bodyCmp = this.nodeMap?.fieldBody?.component;
        if (bodyCmp) bodyCmp.update({ step: v });
    }

    get disabled(): boolean {
        return this.el.classList.contains('q-slider--disabled');
    }
    set disabled(v: boolean) {
        this.toggleCls('q-slider--disabled', v);
        const bodyCmp = this.nodeMap?.fieldBody?.component;
        if (bodyCmp) bodyCmp.update({ disabled: v });
    }

    getFormValue(): any {
        return this._value;
    }

    setFormValue(v: any): void {
        this.value = typeof v === 'number' ? v : parseFloat(String(v));
    }

    formReset(defaultValue?: any): void {
        const num =
            defaultValue !== undefined
                ? typeof defaultValue === 'number'
                    ? defaultValue
                    : parseFloat(String(defaultValue))
                : this._min;
        this.value = isNaN(num) ? this._min : num;
        this.error = '';
    }

    update(props?: Partial<SliderProps>): void {
        super.update(props);
        if (props?.value !== undefined) this.value = props.value;
        if (props?.min !== undefined) this.min = props.min;
        if (props?.max !== undefined) this.max = props.max;
        if (props?.step !== undefined) this.step = props.step;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
    }
}

SliderComponent.define({
    type: 'Slider',
    cls: 'q-formfield',
    body: {
        nodes: {
            fieldBody: { type: SliderFieldBodyComponent },
        },
    },
});

export { SliderComponent };
export type SliderComponentInstance = InstanceType<typeof SliderComponent>;
