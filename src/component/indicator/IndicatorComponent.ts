/**
 * IndicatorComponent 指示器浮层组件
 *
 * 轻量索引指示器，用于走马灯、步骤条、分页器、标签页等场景。
 * 作为浮层挂载到 OverlayRoot，通过 floats 声明使用。
 * 可选 prev/next 箭头切换，事件走 component.bind 委托。
 *
 * 模板节点：
 * - prevBtn — 上一项箭头按钮
 * - nextBtn — 下一项箭头按钮
 * - items   — 指示项容器
 *
 * 使用方式（在父组件 floats 中声明）：
 * ```ts
 * floats: {
 *     indicator: { type: 'Indicator', trigger: 'always', placement: 'bottom', arrows: true }
 * }
 * ```
 *
 * 手动创建：
 * ```ts
 * new IndicatorComponent({ count: 5, activeIndex: 0, type: 'dot' })
 * indicator.on('change', ({ index }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export type IndicatorType = 'dot' | 'number' | 'dash' | string;

export interface IndicatorProps {
    count?: number;
    activeIndex?: number;
    type?: IndicatorType;
    itemTpl?: (index: number) => HTMLElement;
    arrows?: boolean;
    anchor?: HTMLElement;
}

export let IndicatorComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-indicator',
        children: [
            {
                tag: 'div',
                name: 'prevBtn',
                cls: 'q-indicator__arrow q-indicator__arrow--prev',
                hidden: true,
            },
            { tag: 'div', name: 'items', cls: 'q-indicator__items' },
            {
                tag: 'div',
                name: 'nextBtn',
                cls: 'q-indicator__arrow q-indicator__arrow--next',
                hidden: true,
            },
        ],
    },
    tplEvents: {
        prevBtn: { click: { handler: true } },
        nextBtn: { click: { handler: true } },
    },
    body: {
        type: 'Indicator',

        onInitState() {
            return {
                _count: 0,
                _activeIndex: -1,
                _indicatorType: 'dot' as IndicatorType,
                _itemEls: [] as HTMLElement[],
                _itemTpl: undefined as ((index: number) => HTMLElement) | undefined,
                _clickBound: false,
                _arrows: false,
            };
        },

        onAfterInit(props?: IndicatorProps): void {
            this._initIndicator(props);
        },

        onPrevBtnClick(): void {
            this.prev();
        },

        onNextBtnClick(): void {
            this.next();
        },

        _initIndicator(props?: IndicatorProps): void {
            if (props?.type) this._indicatorType = props.type;
            if (props?.itemTpl) this._itemTpl = props.itemTpl;
            if (props?.arrows) this._arrows = props.arrows;
            if (props?.count) {
                this._count = props.count;
                this._renderItems();
            }
            if (props?.activeIndex !== undefined) {
                this._activeIndex = props.activeIndex;
                this._applyActive();
            }

            this.addCls(`q-indicator--${this._indicatorType}`);
            this._updateArrows();
            this._bindItemClick();
        },

        _bindItemClick(): void {
            if (this._clickBound) return;
            const container = this.nodeMap?.items?.el as HTMLElement | null;
            if (!container) return;

            this._clickBound = true;
            this.bind(container, 'click');
            this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
                const target = ctx?.data?.originalEvent?.target as HTMLElement | null;
                const itemEl = target?.closest('.q-indicator__item') as HTMLElement | null;
                const index = itemEl?.dataset?.index;
                if (index !== undefined) {
                    this._activeIndex = Number(index);
                    this._applyActive();
                    this.emit('change', { index: this._activeIndex });
                }
            });
        },

        _updateArrows(): void {
            if (!this._arrows) return;
            this.setNodeHidden(false, 'prevBtn');
            this.setNodeHidden(false, 'nextBtn');
            this.addCls('q-indicator--arrows');
        },

        prev(): void {
            if (this._activeIndex > 0) {
                this.activeIndex = this._activeIndex - 1;
            }
        },

        next(): void {
            if (this._activeIndex < this._count - 1) {
                this.activeIndex = this._activeIndex + 1;
            }
        },

        get count(): number {
            return this._count;
        },
        set count(value: number) {
            this._count = value;
            this._renderItems();
        },

        get activeIndex(): number {
            return this._activeIndex;
        },
        set activeIndex(value: number) {
            this._activeIndex = value;
            this._applyActive();
        },

        get indicatorType(): IndicatorType {
            return this._indicatorType;
        },
        set indicatorType(value: IndicatorType) {
            this.removeCls(`q-indicator--${this._indicatorType}`);
            this._indicatorType = value;
            this.addCls(`q-indicator--${this._indicatorType}`);
            this._renderItems();
        },

        get itemTpl(): ((index: number) => HTMLElement) | undefined {
            return this._itemTpl;
        },
        set itemTpl(value: ((index: number) => HTMLElement) | undefined) {
            this._itemTpl = value;
            this._renderItems();
        },

        _renderItems(): void {
            const container = this.nodeMap?.items?.el as HTMLElement | null;
            if (!container) return;

            container.innerHTML = '';
            this._itemEls = [];

            for (let i = 0; i < this._count; i++) {
                const itemEl = this._itemTpl ? this._itemTpl(i) : this._createDefaultItem(i);

                itemEl.classList.add('q-indicator__item');
                itemEl.dataset.index = String(i);

                container.appendChild(itemEl);
                this._itemEls.push(itemEl);
            }

            this._applyActive();
        },

        _createDefaultItem(index: number): HTMLElement {
            const el = document.createElement('span');
            if (this._indicatorType === 'number') {
                el.textContent = String(index + 1);
            }
            return el;
        },

        _applyActive(): void {
            for (let i = 0; i < this._itemEls.length; i++) {
                this._itemEls[i].classList.toggle(
                    'q-indicator__item--active',
                    i === this._activeIndex
                );
            }
        },

        onOverlayChange(data: any): void {
            if (!data) return;
            if (data.count !== undefined) this.count = data.count;
            if (data.activeIndex !== undefined) this.activeIndex = data.activeIndex;
            if (data.type !== undefined) this.indicatorType = data.type;
            if (data.arrows !== undefined) {
                this._arrows = data.arrows;
                this._updateArrows();
            }
        },

        update(props?: Partial<IndicatorProps>): void {
            if (props?.type !== undefined) this.indicatorType = props.type;
            if (props?.count !== undefined) this.count = props.count;
            if (props?.activeIndex !== undefined) this.activeIndex = props.activeIndex;
            if (props?.itemTpl !== undefined) this.itemTpl = props.itemTpl;
            if (props?.arrows !== undefined) {
                this._arrows = props.arrows;
                this._updateArrows();
            }
        },
    },
});

export type IndicatorComponent = InstanceType<typeof IndicatorComponent>;
