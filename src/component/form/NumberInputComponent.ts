import { InputComponent } from './InputComponent';
import { Definitions } from '@/composable';
import { STEPS_ORDER } from './constants';
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
        // type=number 原生禁止文本字符输入；原生 spinner 由 CSS 隐藏（见 numberinput.css）
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
    _stepsItem: any = null;
    _upBtn: HTMLElement | null = null;
    _downBtn: HTMLElement | null = null;

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
        if (fieldItem) fieldItem.inputMode = this.precision != null ? 'decimal' : 'numeric';
    }

    /**
     * steps 容器走模板 item（零组件实例）：一个 div 垂直排两个 button>i 图标，
     * 上下顺序由 DOM 顺序天然决定，不依赖 absolute/order。
     */
    _mountStepButtons(): void {
        if (this._stepsItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;

        const stepsItem = fieldBodyCmp.add({
            tag: 'div',
            classes: 'q-number-input__steps',
            children: [
                {
                    tag: 'button',
                    classes: 'q-number-input__step q-number-input__step-up',
                    attributes: { type: 'button' },
                    children: [{ tag: 'i', classes: 'q-icon q-icon-chevron-up' }],
                },
                {
                    tag: 'button',
                    classes: 'q-number-input__step q-number-input__step-down',
                    attributes: { type: 'button' },
                    children: [{ tag: 'i', classes: 'q-icon q-icon-chevron-down' }],
                },
            ],
        } as any);
        this._stepsItem = stepsItem;

        if (stepsItem) {
            stepsItem.order = STEPS_ORDER;
        }

        const stepsEl: HTMLElement | null = stepsItem?.el ?? null;
        const upBtn = stepsEl?.querySelector('.q-number-input__step-up') as HTMLElement | null;
        const downBtn = stepsEl?.querySelector('.q-number-input__step-down') as HTMLElement | null;
        upBtn?.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.stepUp();
        });
        downBtn?.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.stepDown();
        });
        this._upBtn = upBtn;
        this._downBtn = downBtn;
    }

    _unmountStepButtons(): void {
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp && this._stepsItem) {
            const idx = fieldBodyCmp.items?.indexOf(this._stepsItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._stepsItem = null;
        this._upBtn = null;
        this._downBtn = null;
    }

    stepUp(): void {
        const base = Number.isFinite(this._numValue) ? this._numValue : (this.min ?? 0);
        const next = clamp(toPrecision(base + this.step, this.precision), this.min, this.max);
        if (!Number.isFinite(next)) return;
        this._numValue = next;
        this.value = String(next);
        this._dispatchFieldEvents();
        this.emit('stepUp', { value: next });
    }

    stepDown(): void {
        const base = Number.isFinite(this._numValue) ? this._numValue : (this.min ?? 0);
        const next = clamp(toPrecision(base - this.step, this.precision), this.min, this.max);
        if (!Number.isFinite(next)) return;
        this._numValue = next;
        this.value = String(next);
        this._dispatchFieldEvents();
        this.emit('stepDown', { value: next });
    }

    /** 步进是编程赋值，不触发原生事件；手动派发让 listens/domEvents 的 input/change 联动 */
    _dispatchFieldEvents(): void {
        const el = this._getFieldEl();
        if (!el) return;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /** value option 直设 el.value，同步解析到 _numValue，避免步进从 min 起算 */
    _onValueOptionChange(value: string): void {
        super._onValueOptionChange(value);
        const num = parseFloat(String(value ?? ''));
        this._numValue = isNaN(num) ? NaN : num;
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
        // NaN 显式转 null，避免 JSON 序列化歧义
        return { value: Number.isFinite(this._numValue) ? this._numValue : null, rawValue: this.value };
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
