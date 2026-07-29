/**
 * RatingComponent 评分组件
 *
 * 星级评分，支持半星、只读、自定义图标数。
 *
 * 模板节点：
 * - stars — 星级容器
 *
 * 事件：
 * - change — 评分变化时触发，数据 { value }
 *
 * @example
 * new RatingComponent({ value: 3, max: 5 })
 * new RatingComponent({ value: 2.5, allowHalf: true })
 * new RatingComponent({ readonly: true, value: 4 })
 * rating.on('change', ({ value }) => { ... })
 */

import { Component, CommonPropsAbility } from '@qimenjs/component-core';

export interface RatingProps {
    value?: number;
    max?: number;
    allowHalf?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    cls?: string;
}

class RatingComponent extends Component {
    _value = 0;
    _max = 5;
    _allowHalf = false;
    _readonly = false;
    _disabled = false;
    _hoverValue = -1;

    onAfterInit(props?: RatingProps): void {
        this._initRating(props);
    }

    _initRating(props?: RatingProps): void {
        if (props?.max) this._max = props.max;
        if (props?.allowHalf) this._allowHalf = true;
        if (props?.readonly) this._readonly = true;
        if (props?.disabled) this._disabled = true;
        if (props?.cls) this.addCls(props.cls);

        this._renderStars();
        if (props?.value !== undefined) this._applyValue(props.value);
        this._applyState();
        this._bindEvents();
    }

    _renderStars(): void {
        const container = this.nodeMap?.stars?.el as HTMLElement | null;
        if (!container) return;
        container.innerHTML = '';

        for (let i = 1; i <= this._max; i++) {
            const star = document.createElement('span');
            star.className = 'q-rating__star';
            star.dataset.index = String(i);

            if (this._allowHalf) {
                const left = document.createElement('span');
                left.className = 'q-rating__star-left';
                left.dataset.index = String(i);
                left.dataset.half = 'left';

                const right = document.createElement('span');
                right.className = 'q-rating__star-right';
                right.dataset.index = String(i);
                right.dataset.half = 'right';

                star.appendChild(left);
                star.appendChild(right);
            }

            container.appendChild(star);
        }
    }

    _bindEvents(): void {
        const container = this.nodeMap?.stars?.el as HTMLElement | null;
        if (!container || this._readonly) return;

        container.addEventListener('mousemove', (e: MouseEvent) => {
            if (this._disabled) return;
            const target = e.target as HTMLElement;
            const value = this._getValueFromEvent(target);
            if (value >= 0) {
                this._hoverValue = value;
                this._applyVisual(value);
            }
        });

        container.addEventListener('mouseleave', () => {
            if (this._disabled) return;
            this._hoverValue = -1;
            this._applyVisual(this._value);
        });

        container.addEventListener('click', (e: MouseEvent) => {
            if (this._disabled || this._readonly) return;
            const target = e.target as HTMLElement;
            const value = this._getValueFromEvent(target);
            if (value >= 0) {
                this._value = value;
                this._applyValue(value);
                this.emit('change', { value: this._value });
            }
        });
    }

    _getValueFromEvent(target: HTMLElement): number {
        if (this._allowHalf) {
            const half = target.dataset.half;
            const index = target.dataset.index || target.parentElement?.dataset.index;
            if (!index) return -1;
            const i = Number(index);
            if (half === 'left') return i - 0.5;
            if (half === 'right') return i;
            return i;
        }
        const index = target.dataset.index;
        if (!index) return -1;
        return Number(index);
    }

    _applyValue(value: number): void {
        this._value = value;
        this._applyVisual(value);
        this.setAttr('aria-valuenow', String(value));
        this.setAttr('aria-valuemin', '0');
        this.setAttr('aria-valuemax', String(this._max));
    }

    _applyVisual(value: number): void {
        const container = this.nodeMap?.stars?.el as HTMLElement | null;
        if (!container) return;

        const stars = container.querySelectorAll<HTMLElement>('.q-rating__star');
        stars.forEach((star, i) => {
            const idx = i + 1;
            star.classList.remove(
                'q-rating__star--full',
                'q-rating__star--half',
                'q-rating__star--empty'
            );

            if (idx <= Math.floor(value)) {
                star.classList.add('q-rating__star--full');
            } else if (this._allowHalf && idx === Math.ceil(value) && value % 1 !== 0) {
                star.classList.add('q-rating__star--half');
            } else {
                star.classList.add('q-rating__star--empty');
            }
        });
    }

    _applyState(): void {
        this.toggleCls('q-rating--readonly', this._readonly);
        this.toggleCls('q-rating--disabled', this._disabled);
        if (this._disabled) {
            this.setAttr('aria-disabled', 'true');
        }
    }

    get value(): number {
        return this._value;
    }
    set value(v: number) {
        this._applyValue(v);
    }

    get max(): number {
        return this._max;
    }
    set max(v: number) {
        this._max = v;
        this._renderStars();
        this._applyVisual(this._value);
    }

    get readonly(): boolean {
        return this._readonly;
    }
    set readonly(v: boolean) {
        this._readonly = v;
        this._applyState();
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this._applyState();
    }

    getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
        return { value: this._value };
    }

    update(props?: Partial<RatingProps>): void {
        if (props?.value !== undefined) this.value = props.value;
        if (props?.max !== undefined) this.max = props.max;
        if (props?.allowHalf !== undefined) {
            this._allowHalf = props.allowHalf;
            this._renderStars();
            this._applyVisual(this._value);
        }
        if (props?.readonly !== undefined) this.readonly = props.readonly;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.cls !== undefined) this.addCls(props.cls);
    }
}

RatingComponent.use([CommonPropsAbility]);

export { RatingComponent };
export type RatingComponentInstance = InstanceType<typeof RatingComponent>;
