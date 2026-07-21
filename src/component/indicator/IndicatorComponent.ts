/**
 * IndicatorComponent 指示器组件
 *
 * 轻量索引指示器，用于走马灯、步骤条、分页器、标签页等场景。
 * 直接管理 DOM 子项的 active 标记，事件走 component.bind 委托。
 *
 * 模板节点：
 * - items — 指示项容器
 *
 * @example
 * ```ts
 * // 圆点指示器
 * new IndicatorComponent({ count: 5, activeIndex: 0, type: 'dot' })
 *
 * // 数字指示器
 * new IndicatorComponent({ count: 3, activeIndex: 1, type: 'number' })
 *
 * // 自定义指示项
 * new IndicatorComponent({
 *     count: 4,
 *     type: 'custom',
 *     itemTpl: (i) => { const el = document.createElement('span'); el.textContent = `P${i+1}`; return el; }
 * })
 *
 * // 监听切换
 * indicator.on('change', ({ index }) => { ... })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export type IndicatorType = 'dot' | 'number' | 'dash' | string;

export interface IndicatorProps {
    count?: number;
    activeIndex?: number;
    type?: IndicatorType;
    itemTpl?: (index: number) => HTMLElement;
}

export let IndicatorComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-indicator',
        children: [{ tag: 'div', name: 'items', cls: 'q-indicator__items' }],
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
            };
        },

        _initIndicator(props?: IndicatorProps): void {
            if (props?.type) this._indicatorType = props.type;
            if (props?.itemTpl) this._itemTpl = props.itemTpl;
            if (props?.count) {
                this._count = props.count;
                this._renderItems();
            }
            if (props?.activeIndex !== undefined) {
                this._activeIndex = props.activeIndex;
                this._applyActive();
            }

            this.addCls(`q-indicator--${this._indicatorType}`);
            this._bindClick();
        },

        _bindClick(): void {
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

        update(props?: Partial<IndicatorProps>): void {
            if (props?.type !== undefined) this.indicatorType = props.type;
            if (props?.count !== undefined) this.count = props.count;
            if (props?.activeIndex !== undefined) this.activeIndex = props.activeIndex;
            if (props?.itemTpl !== undefined) this.itemTpl = props.itemTpl;
        },
    },
});

export type IndicatorComponent = InstanceType<typeof IndicatorComponent>;
