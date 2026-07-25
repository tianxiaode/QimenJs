/**
 * NumberInputComponent 数字输入框组件
 *
 * 基于 InputComponent 通过 .replace() 派生，共享统一模板。
 * 通过 nodeOverrides 设置 field type 为 number，添加步进按钮到 actions。
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
import type { ValidationRule } from '@qimenjs/schema';

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

function getFieldEl(cmp: any): HTMLInputElement | null {
    return cmp.nodeMap?.field?.el as HTMLInputElement | null;
}

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

export let NumberInputComponent = InputComponent.replace({
    type: 'NumberInput',

    body: {
        nodes: {
            root: { addCls: 'q-input--number' },
        },

        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _numValue: NaN as number,
                _min: undefined as number | undefined,
                _max: undefined as number | undefined,
                _step: 1 as number,
                _precision: undefined as number | undefined,
                _stepUpItem: null as any,
                _stepDownItem: null as any,
            };
        },

        onAfterInit(props?: NumberInputProps): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            if (fieldEl) {
                fieldEl.setAttribute('type', 'number');
                fieldEl.setAttribute('inputmode', 'numeric');
            }

            self._min = props?.min;
            self._max = props?.max;
            self._step = props?.step ?? 1;
            self._precision = props?.precision;

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
                self._numValue = props.value;
                self._value = String(props.value);
                if (fieldEl) fieldEl.value = String(props.value);
            }

            if (props?.controls !== false) {
                self._mountStepButtons();
            }
        },

        _mountStepButtons(): void {
            const self = this as any;
            self.setNodeHidden(false, 'actions');

            self.addAction({
                type: 'Text',
                cls: 'q-number-input__step q-number-input__step-up',
                text: '▲',
                order: STEP_UP_ORDER,
            });
            const actionsCmp = self.nodeMap?.actions?.component;
            const items = actionsCmp?._items ?? [];
            self._stepUpItem = items[items.length - 1] ?? null;

            self.addAction({
                type: 'Text',
                cls: 'q-number-input__step q-number-input__step-down',
                text: '▼',
                order: STEP_DOWN_ORDER,
            });
            self._stepDownItem = actionsCmp?._items[actionsCmp._items.length - 1] ?? null;
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
                return;
            }
            if (self._stepUpItem && self._itemsIndexOf(actionsCmp, self._stepUpItem) === index) {
                self.stepUp();
                return;
            }
            if (
                self._stepDownItem &&
                self._itemsIndexOf(actionsCmp, self._stepDownItem) === index
            ) {
                self.stepDown();
                return;
            }
        },

        stepUp(): void {
            const self = this as any;
            const current = isNaN(self._numValue) ? (self._min ?? 0) : self._numValue;
            let next = current + self._step;
            next = toPrecision(next, self._precision);
            next = clamp(next, self._min, self._max);
            self._numValue = next;
            self.value = String(next);
            self.emit('stepUp', { value: next });
        },

        stepDown(): void {
            const self = this as any;
            const current = isNaN(self._numValue) ? (self._min ?? 0) : self._numValue;
            let next = current - self._step;
            next = toPrecision(next, self._precision);
            next = clamp(next, self._min, self._max);
            self._numValue = next;
            self.value = String(next);
            self.emit('stepDown', { value: next });
        },

        onFieldInput(): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            const raw = fieldEl?.value ?? '';
            self._value = raw;
            const num = parseFloat(raw);
            self._numValue = isNaN(num) ? NaN : num;
            self._toggleClearBtn();
            if (self._shouldValidate('input')) self._doValidate();
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: self._numValue, rawValue: self._value };
        },

        get numValue(): number {
            const self = this as any;
            return self._numValue;
        },
        set numValue(v: number) {
            const self = this as any;
            const clamped = toPrecision(clamp(v, self._min, self._max), self._precision);
            self._numValue = clamped;
            self.value = String(clamped);
        },

        getFormValue(): any {
            const self = this as any;
            return self._numValue;
        },

        setFormValue(v: any): void {
            const self = this as any;
            const num = typeof v === 'number' ? v : parseFloat(String(v));
            self._numValue = isNaN(num) ? NaN : num;
            self.value = isNaN(num) ? '' : String(num);
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            const num =
                defaultValue !== undefined
                    ? typeof defaultValue === 'number'
                        ? defaultValue
                        : parseFloat(String(defaultValue))
                    : NaN;
            self._numValue = num;
            self.value = isNaN(num) ? '' : String(num);
            self.error = '';
        },

        update(props?: Partial<NumberInputProps>): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            self._super.update(props);

            if (props?.min !== undefined) {
                self._min = props.min;
                if (fieldEl) fieldEl.setAttribute('min', String(props.min));
            }
            if (props?.max !== undefined) {
                self._max = props.max;
                if (fieldEl) fieldEl.setAttribute('max', String(props.max));
            }
            if (props?.step !== undefined) {
                self._step = props.step;
                if (fieldEl) fieldEl.setAttribute('step', String(props.step));
            }
            if (props?.precision !== undefined) {
                self._precision = props.precision;
            }
            if (props?.value !== undefined) {
                const num =
                    typeof props.value === 'number' ? props.value : parseFloat(String(props.value));
                self._numValue = isNaN(num) ? NaN : num;
                self.value = isNaN(num) ? '' : String(num);
            }
        },
    },
});

export type NumberInputComponent = InstanceType<typeof NumberInputComponent>;
