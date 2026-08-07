/**
 * SliderFieldBodyComponent 滑动条字段体组件
 *
 * 承载 track + fill + thumb + valueLabel，
 * 处理拖拽交互和值计算。
 *
 * 事件：sliderChange（值变化时触发）
 */

import { Component } from '@qimenjs/component-core';
import { SLIDER_BODY_TPL } from './slider-body-tpl';

export interface SliderBodyProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    disabled?: boolean;
}

function clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
}

function toStep(v: number, step: number, min: number): number {
    if (step <= 0) return v;
    const steps = Math.round((v - min) / step);
    return min + steps * step;
}

class SliderFieldBodyComponent extends Component {
    _value: number = 0;
    _min: number = 0;
    _max: number = 100;
    _step: number = 1;
    _showValue: boolean = true;
    _disabled: boolean = false;
    _dragging: boolean = false;

    onAfterInit(props?: SliderBodyProps): void {
        this._min = props?.min ?? 0;
        this._max = props?.max ?? 100;
        this._step = props?.step ?? 1;
        this._showValue = props?.showValue ?? true;
        this._disabled = props?.disabled ?? false;

        const v = clamp(props?.value ?? this._min, this._min, this._max);
        this._value = toStep(v, this._step, this._min);

        this._applyState();
        this._bindDrag();
    }

    private _applyState(): void {
        const ratio =
            this._max === this._min ? 0 : (this._value - this._min) / (this._max - this._min);
        const percent = `${ratio * 100}%`;

        const fillEl = this._resolveNodeEl('fill');
        if (fillEl) fillEl.style.width = percent;

        const thumbEl = this._resolveNodeEl('thumb');
        if (thumbEl) thumbEl.style.left = percent;

        const valueLabelEl = this._resolveNodeEl('valueLabel');
        if (valueLabelEl) {
            valueLabelEl.textContent = String(this._value);
            valueLabelEl.hidden = !this._showValue;
        }

        const trackEl = this._resolveNodeEl('track');
        if (trackEl) {
            trackEl.setAttribute('aria-valuenow', String(this._value));
            trackEl.setAttribute('aria-valuemin', String(this._min));
            trackEl.setAttribute('aria-valuemax', String(this._max));
        }

        this.toggleCls('q-slider--disabled', this._disabled);
        this.toggleCls('q-slider--dragging', this._dragging);
    }

    private _bindDrag(): void {
        const trackEl = this._resolveNodeEl('track');
        if (!trackEl) return;

        const onPointerDown = (e: PointerEvent) => {
            if (this._disabled) return;
            e.preventDefault();
            this._dragging = true;
            this._updateFromPointer(e);
            this._applyState();

            const onPointerMove = (ev: PointerEvent) => {
                this._updateFromPointer(ev);
                this._applyState();
            };

            const onPointerUp = () => {
                this._dragging = false;
                this._applyState();
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);
            };

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        };

        trackEl.addEventListener('pointerdown', onPointerDown);
    }

    private _updateFromPointer(e: PointerEvent): void {
        const trackEl = this._resolveNodeEl('track');
        if (!trackEl) return;

        const rect = trackEl.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const raw = this._min + ratio * (this._max - this._min);
        const stepped = toStep(raw, this._step, this._min);
        const clamped = clamp(stepped, this._min, this._max);

        if (clamped !== this._value) {
            this._value = clamped;
            this.emit('sliderChange', { value: this._value });
        }
    }

    get value(): number {
        return this._value;
    }
    set value(v: number) {
        const clamped = clamp(toStep(v, this._step, this._min), this._min, this._max);
        if (clamped === this._value) return;
        this._value = clamped;
        this._applyState();
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this._applyState();
    }

    update(props?: Partial<SliderBodyProps>): void {
        if (props?.min !== undefined) this._min = props.min;
        if (props?.max !== undefined) this._max = props.max;
        if (props?.step !== undefined) this._step = props.step;
        if (props?.showValue !== undefined) this._showValue = props.showValue;
        if (props?.disabled !== undefined) this._disabled = props.disabled;
        if (props?.value !== undefined) {
            this._value = clamp(toStep(props.value, this._step, this._min), this._min, this._max);
        }
        this._applyState();
    }
}

SliderFieldBodyComponent.useTemplate(SLIDER_BODY_TPL);
export { SliderFieldBodyComponent };
export type SliderFieldBodyComponentInstance = InstanceType<typeof SliderFieldBodyComponent>;
