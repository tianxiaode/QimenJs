import { InputComponent } from './InputComponent';
import { Definitions } from '@/composable';
import { IconComponent } from '../icon/IconComponent';
import { STEP_UP_ORDER, STEP_DOWN_ORDER } from './constants';
import './numberinput.css';

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
        placeholder: null,
        clearable: false,
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
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.min = value;
    }

    _onMaxOptionChange(value: number | null): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.max = value;
    }

    _onStepOptionChange(value: number): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.step = value;
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

        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.inputMode = 'numeric';
    }

    _mountStepButtons(): void {
        if (this._stepUpItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;

        const upItem = fieldBodyCmp.add({
            type: IconComponent,
            iconCls: 'q-chevron-up',
            order: STEP_UP_ORDER,
        });
        if (upItem?.el) {
            upItem.el.classList.add('q-number-input__step', 'q-number-input__step-up');
            upItem.el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                this.stepUp();
            });
        }
        this._stepUpItem = upItem;

        const downItem = fieldBodyCmp.add({
            type: IconComponent,
            iconCls: 'q-chevron-down',
            order: STEP_DOWN_ORDER,
        });
        if (downItem?.el) {
            downItem.el.classList.add('q-number-input__step', 'q-number-input__step-down');
            downItem.el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                this.stepDown();
            });
        }
        this._stepDownItem = downItem;
    }

    _unmountStepButtons(): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        for (const ref of [this._stepUpItem, this._stepDownItem]) {
            if (!ref) continue;
            const idx = fieldBodyCmp.items?.indexOf(ref) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._stepUpItem = null;
        this._stepDownItem = null;
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
        const fieldEl = this._getFieldEl();
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
