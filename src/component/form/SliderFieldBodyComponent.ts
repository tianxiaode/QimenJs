import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { SLIDER_BODY_TPL } from './slider-body-tpl';

function clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
}

function toStep(v: number, step: number, min: number): number {
    if (step <= 0) return v;
    const steps = Math.round((v - min) / step);
    return min + steps * step;
}

const SliderFieldBodyComponentDefs: Definitions = {
    options: {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        showValue: true,
    },
} as const;

class SliderFieldBodyComponent extends Component {
    static type = 'SliderFieldBody';

    get tpl(): TemplateDecl {
        return SLIDER_BODY_TPL;
    }

    _dragging: boolean = false;

    _onValueOptionChange(_value: number): void {
        this._applyState();
    }

    _onMinOptionChange(_value: number): void {
        this._applyState();
    }

    _onMaxOptionChange(_value: number): void {
        this._applyState();
    }

    _onStepOptionChange(_value: number): void {
        this._applyState();
    }

    _onShowValueOptionChange(value: boolean): void {
        const valueLabelEl = this.getNodeEl('valueLabel');
        if (valueLabelEl) {
            (valueLabelEl as HTMLElement).hidden = !value;
        }
    }

    onAfterInit(): void {
        this._applyState();
        this._bindDrag();
    }

    _applyState(): void {
        const value = this.value as number;
        const min = this.min as number;
        const max = this.max as number;
        const ratio = max === min ? 0 : (value - min) / (max - min);
        const percent = `${ratio * 100}%`;

        const fillEl = this.getNodeEl('fill');
        if (fillEl) (fillEl as HTMLElement).style.width = percent;

        const thumbEl = this.getNodeEl('thumb');
        if (thumbEl) (thumbEl as HTMLElement).style.left = percent;

        const valueLabelEl = this.getNodeEl('valueLabel');
        if (valueLabelEl) {
            (valueLabelEl as HTMLElement).textContent = String(value);
            (valueLabelEl as HTMLElement).hidden = !this.showValue;
        }

        const trackEl = this.getNodeEl('track');
        if (trackEl) {
            (trackEl as HTMLElement).setAttribute('aria-valuenow', String(value));
            (trackEl as HTMLElement).setAttribute('aria-valuemin', String(min));
            (trackEl as HTMLElement).setAttribute('aria-valuemax', String(max));
        }

        this.toggleCls('q-slider--dragging', this._dragging);
    }

    _bindDrag(): void {
        const trackEl = this.getNodeEl('track');
        if (!trackEl) return;

        const onPointerDown = (e: PointerEvent) => {
            if (this.disable) return;
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

        (trackEl as HTMLElement).addEventListener('pointerdown', onPointerDown);
    }

    _updateFromPointer(e: PointerEvent): void {
        const trackEl = this.getNodeEl('track');
        if (!trackEl) return;

        const rect = (trackEl as HTMLElement).getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const min = this.min as number;
        const max = this.max as number;
        const step = this.step as number;
        const raw = min + ratio * (max - min);
        const stepped = toStep(raw, step, min);
        const clamped = clamp(stepped, min, max);

        if (clamped !== (this.value as number)) {
            this.value = clamped;
            this.emit('sliderChange', { value: clamped });
        }
    }
}

SliderFieldBodyComponent.define(SliderFieldBodyComponentDefs);

export { SliderFieldBodyComponent };
export type SliderFieldBodyComponentInstance = InstanceType<typeof SliderFieldBodyComponent>;
