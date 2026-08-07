/**
 * NumberInputComponent 数字输入框组件
 *
 * 从 InputComponent 派生，共享统一模板（继承父类模板，无需 useTemplate）。
 * 设置 field type 为 number，添加步进按钮到 actions。
 *
 * 特有功能：
 * - min/max/step 数值约束
 * - 步进按钮（增加/减少）
 * - precision 小数精度控制
 * - 数值格式化显示
 *
 * 事件：input / focus / blur / change / stepUp / stepDown。
 *
 * @example
 * ```ts
 * new NumberInputComponent({ value: 0, min: 0, max: 100, step: 1 })
 * num.on('input', ({ value }) => { ... })
 * ```
 */

import { InputComponent, type InputProps } from './InputComponent';
import { TextComponent } from '../text/TextComponent';
import './numberinput.css.ts';

export interface NumberInputProps extends Omit<InputProps, 'value'> {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
}

const STEP_UP_ORDER = 20;
const STEP_DOWN_ORDER = 21;

function clamp(v: number, min?: number, max?: number): number {
    if (min !== undefined && v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
}

function toPrecision(v: number, precision?: number): number {
    if (precision === undefined || precision < 0) return v;
    const factor = Math.pow(10, precision);
    return Math.round(v * factor) / factor;
}

class NumberInputComponent extends InputComponent {
    _numValue: number = NaN;
    _min: number | undefined = undefined;
    _max: number | undefined = undefined;
    _step: number = 1;
    _precision: number | undefined = undefined;
    _stepUpItem: any = null;
    _stepDownItem: any = null;

    onAfterInit(props?: NumberInputProps): void {
        super.onAfterInit(props);
        this.addCls('q-input--number');

        const fieldEl = this.field;

        if (fieldEl) {
            fieldEl.setAttribute('type', 'number');
            fieldEl.setAttribute('inputmode', 'numeric');
        }

        this._min = props?.min;
        this._max = props?.max;
        this._step = props?.step ?? 1;
        this._precision = props?.precision;

        if (props?.min !== undefined && fieldEl) {
            fieldEl.setAttribute('min', String(props.min));
        }
        if (props?.max !== undefined && fieldEl) {
            fieldEl.setAttribute('max', String(props.max));
        }
        if (props?.step !== undefined && fieldEl) {
            fieldEl.setAttribute('step', String(props.step));
        }

        if (props?.value !== undefined) {
            this._numValue = props.value;
            this._value = String(props.value);
            if (fieldEl) fieldEl.value = String(props.value);
        }

        if (props?.controls !== false) {
            this._mountStepButtons();
        }
    }

    _mountStepButtons(): void {
        this.setNodeHidden(false, 'actions');

        this.addAction({
            type: TextComponent,
            cls: 'q-number-input__step q-number-input__step-up',
            text: '▲',
            order: STEP_UP_ORDER,
        });
        const actionsCmp = this.nodeMap?.actions?.component;
        const items = actionsCmp?._items ?? [];
        this._stepUpItem = items[items.length - 1] ?? null;

        this.addAction({
            type: TextComponent,
            cls: 'q-number-input__step q-number-input__step-down',
            text: '▼',
            order: STEP_DOWN_ORDER,
        });
        this._stepDownItem = actionsCmp?._items[actionsCmp._items.length - 1] ?? null;
    }

    onFieldBodyActionClick(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return;

        if (this._clearBtnItem && this._itemsIndexOf(actionsCmp, this._clearBtnItem) === index) {
            this.onClearBtnClick();
            return;
        }
        if (this._stepUpItem && this._itemsIndexOf(actionsCmp, this._stepUpItem) === index) {
            this.stepUp();
            return;
        }
        if (this._stepDownItem && this._itemsIndexOf(actionsCmp, this._stepDownItem) === index) {
            this.stepDown();
            return;
        }
    }

    stepUp(): void {
        const current = isNaN(this._numValue) ? (this._min ?? 0) : this._numValue;
        let next = current + this._step;
        next = toPrecision(next, this._precision);
        next = clamp(next, this._min, this._max);
        this._numValue = next;
        this.value = String(next);
        this.emit('stepUp', { value: next });
    }

    stepDown(): void {
        const current = isNaN(this._numValue) ? (this._min ?? 0) : this._numValue;
        let next = current - this._step;
        next = toPrecision(next, this._precision);
        next = clamp(next, this._min, this._max);
        this._numValue = next;
        this.value = String(next);
        this.emit('stepDown', { value: next });
    }

    onFieldInput(): void {
        const fieldEl = this.field;
        const raw = fieldEl?.value ?? '';
        this._value = raw;
        const num = parseFloat(raw);
        this._numValue = isNaN(num) ? NaN : num;
        this._toggleClearBtn();
        if (this._shouldValidate('input')) this._doValidate();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._numValue, rawValue: this._value };
    }

    get numValue(): number {
        return this._numValue;
    }
    set numValue(v: number) {
        const clamped = toPrecision(clamp(v, this._min, this._max), this._precision);
        this._numValue = clamped;
        this.value = String(clamped);
    }

    getFormValue(): any {
        return this._numValue;
    }

    setFormValue(v: any): void {
        const num = typeof v === 'number' ? v : parseFloat(String(v));
        this._numValue = isNaN(num) ? NaN : num;
        this.value = isNaN(num) ? '' : String(num);
    }

    formReset(defaultValue?: any): void {
        const num =
            defaultValue !== undefined
                ? typeof defaultValue === 'number'
                    ? defaultValue
                    : parseFloat(String(defaultValue))
                : NaN;
        this._numValue = num;
        this.value = isNaN(num) ? '' : String(num);
        this.error = '';
    }

    update(props?: Partial<NumberInputProps>): void {
        super.update(props);
        const fieldEl = this.field;

        if (props?.min !== undefined) {
            this._min = props.min;
            if (fieldEl) fieldEl.setAttribute('min', String(props.min));
        }
        if (props?.max !== undefined) {
            this._max = props.max;
            if (fieldEl) fieldEl.setAttribute('max', String(props.max));
        }
        if (props?.step !== undefined) {
            this._step = props.step;
            if (fieldEl) fieldEl.setAttribute('step', String(props.step));
        }
        if (props?.precision !== undefined) {
            this._precision = props.precision;
        }
        if (props?.value !== undefined) {
            const num =
                typeof props.value === 'number' ? props.value : parseFloat(String(props.value));
            this._numValue = isNaN(num) ? NaN : num;
            this.value = isNaN(num) ? '' : String(num);
        }
    }
}

export { NumberInputComponent };
export type NumberInputComponentInstance = InstanceType<typeof NumberInputComponent>;
