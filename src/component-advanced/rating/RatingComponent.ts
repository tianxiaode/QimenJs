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
import { Definitions } from '@/composable';
import { RATING_TPL } from './rating-tpl';
import './rating.css';

const RatingComponentDefs: Definitions = {
    options: {
        value: 0,
        max: 5,
        allowHalf: false,
        readonly: false,
        disabled: false,
    },
} as const;

class RatingComponent extends Component {
    _hoverValue = -1;

    _onValueOptionChange(value: number): void {
        this._applyVisual(value);
        this.setAttr('aria-valuenow', String(value));
    }

    _onMaxOptionChange(): void {
        this._renderStars();
        this._applyVisual(this.value);
        this.setAttr('aria-valuemin', '0');
        this.setAttr('aria-valuemax', String(this.max));
    }

    _onAllowHalfOptionChange(): void {
        this._renderStars();
        this._applyVisual(this.value);
    }

    _onReadonlyOptionChange(): void {
        this._applyState();
    }

    _onDisabledOptionChange(): void {
        this._applyState();
    }

    onAfterInit(): void {
        this.setAttr('aria-valuemin', '0');
        this.setAttr('aria-valuemax', String(this.max));
        this._renderStars();
        this._applyVisual(this.value);
        this._applyState();
        this._bindEvents();
    }

    _renderStars(): void {
        this.setNodeHtml('', 'stars');
        const container = this._resolveNodeEl('stars');
        if (!container) return;

        for (let i = 1; i <= this.max; i++) {
            const star = document.createElement('span');
            star.className = 'q-rating__star';
            star.dataset.index = String(i);

            if (this.allowHalf) {
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
        const container = this._resolveNodeEl('stars');
        if (!container || this.readonly) return;

        container.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.disabled) return;
            const target = e.target as HTMLElement;
            const value = this._getValueFromEvent(target);
            if (value >= 0) {
                this._hoverValue = value;
                this._applyVisual(value);
            }
        });

        container.addEventListener('mouseleave', () => {
            if (this.disabled) return;
            this._hoverValue = -1;
            this._applyVisual(this.value);
        });

        container.addEventListener('click', (e: MouseEvent) => {
            if (this.disabled || this.readonly) return;
            const target = e.target as HTMLElement;
            const value = this._getValueFromEvent(target);
            if (value >= 0) {
                this.value = value;
                this.emit('change', { value: this.value });
            }
        });
    }

    _getValueFromEvent(target: HTMLElement): number {
        if (this.allowHalf) {
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

    _applyVisual(value: number): void {
        const container = this._resolveNodeEl('stars');
        if (!container) return;

        const stars = container.querySelectorAll('.q-rating__star') as NodeListOf<HTMLElement>;
        stars.forEach((star: HTMLElement, i: number) => {
            const idx = i + 1;
            star.classList.remove(
                'q-rating__star--full',
                'q-rating__star--half',
                'q-rating__star--empty'
            );

            if (idx <= Math.floor(value)) {
                star.classList.add('q-rating__star--full');
            } else if (this.allowHalf && idx === Math.ceil(value) && value % 1 !== 0) {
                star.classList.add('q-rating__star--half');
            } else {
                star.classList.add('q-rating__star--empty');
            }
        });
    }

    _applyState(): void {
        this.toggleCls('q-rating--readonly', this.readonly);
        this.toggleCls('q-rating--disabled', this.disabled);
        if (this.disabled) {
            this.setAttr('aria-disabled', 'true');
        }
    }

    get defaultEventData(): Record<string, any> {
        return { ...super.defaultEventData, value: this.value };
    }

    update(props?: Record<string, any>): void {
        if (props?.value !== undefined) this.value = props.value;
        if (props?.max !== undefined) this.max = props.max;
        if (props?.allowHalf !== undefined) this.allowHalf = props.allowHalf;
        if (props?.readonly !== undefined) this.readonly = props.readonly;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.cls !== undefined) this.addCls(props.cls);
    }
}

RatingComponent.use([CommonPropsAbility]);
RatingComponent.useTemplate(RATING_TPL);
RatingComponent.define(RatingComponentDefs);

export { RatingComponent };
/** 评分实例类型 */
export type RatingComponentInstance = InstanceType<typeof RatingComponent>;
