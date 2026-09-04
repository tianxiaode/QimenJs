import { InputComponent, type InputProps } from './InputComponent';
import { Definitions } from '@/composable';
import { TextComponent } from '../text/TextComponent';
import './numberinput.css';

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

const NumberInputComponentDefs: Definitions = {
    options: {
        type: 'number',
        min: null,
        max: null,
        step: 1,
        precision: null,
        controls: true,
    },
} as const;

class NumberInputComponent extends InputComponent {
    static type = 'number-input';

    _numValue: number = NaN;
    _stepUpItem: any = null;
    _stepDownItem: any = null;

    _onMinOptionChange(value: number | null): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value != null) fieldEl.setAttribute('min', String(value));
        else fieldEl.removeAttribute('min');
    }

    _onMaxOptionChange(value: number | null): void {
        const fieldEl = this.getNodeEl('field');
        if (!fieldEl) return;
        if (value != null) fieldEl.setAttribute('max', String(value));
        else fieldEl.removeAttribute('max');
    }

    _onStepOptionChange(value: number): void {
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) fieldEl.setAttribute('step', String(value));
    }

    _onControlsOptionChange(value: boolean): void {
        if (value) {
            this._mountStepButtons();
        } else {
            this._unmountStepButtons();
        }
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-input--number');

        const fieldEl = this.getNodeEl('field');
        if (fieldEl) {
            fieldEl.setAttribute('inputmode', 'numeric');
        }
    }

    _mountStepButtons(): void {
        if (this._stepUpItem) return;
        this._setNodeHidden(false, 'actions');

        this.addAction({
            type: TextComponent,
            cls: 'q-number-input__step q-number-input__step-up',
            text: '▲',
            order: STEP_UP_ORDER,
        });
        const actionsCmp = this.getComponent('actions') as any;
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

    _unmountStepButtons(): void {
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return;
        if (this._stepUpItem) {
            const idx = this._itemsIndexOf(actionsCmp, this._stepUpItem);
            if (idx >= 0) actionsCmp.removeAt(idx);
            this._stepUpItem = null;
        }
        if (this._stepDownItem) {
            const idx = this._itemsIndexOf(actionsCmp, this._stepDownItem);
            if (idx >= 0) actionsCmp.removeAt(idx);
            this._stepDownItem = null;
        }
    }

    onFieldBodyActionClick(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const actionsCmp = this.getComponent('actions') as any;
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
        const current = isNaN(this._numValue) ? (this.min ?? 0) : this._numValue;
        let next = current + this.step;
        next = toPrecision(next, this.precision);
        next = clamp(next, this.min, this.max);
        this._numValue = next;
        this.value = String(next);
        this.emit('stepUp', { value: next });
    }

    stepDown(): void {
        const current = isNaN(this._numValue) ? (this.min ?? 0) : this._numValue;
        let next = current - this.step;
        next = toPrecision(next, this.precision);
        next = clamp(next, this.min, this.max);
        this._numValue = next;
        this.value = String(next);
        this.emit('stepDown', { value: next });
    }

    onFieldInput(): void {
        const fieldEl = this.getNodeEl('field') as HTMLInputElement | undefined;
        const raw = fieldEl?.value ?? '';
        this.value = raw;
        const num = parseFloat(raw);
        this._numValue = isNaN(num) ? NaN : num;
        this._toggleClearBtn();
        if (this._shouldValidate('input')) this._doValidate();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._numValue, rawValue: this.value };
    }

    get numValue(): number {
        return this._numValue;
    }
    set numValue(v: number) {
        const clamped = toPrecision(clamp(v, this.min, this.max), this.precision);
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
}

NumberInputComponent.define(NumberInputComponentDefs);

export { NumberInputComponent };
export type NumberInputComponentInstance = InstanceType<typeof NumberInputComponent>;
