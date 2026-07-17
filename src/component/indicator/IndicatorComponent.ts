/**
 * IndicatorComponent 指示器组件
 *
 * 轻量索引指示器，用于走马灯、步骤条、分页器、标签页等场景。
 * 不依赖 ItemGroup 池化，直接管理 DOM 子项的 active 标记。
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
 * // 监听切换
 * indicator.on('change', ({ index }) => { ... })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';

export type IndicatorType = 'dot' | 'number' | 'dash';

export interface IndicatorProps {
    count?: number;
    activeIndex?: number;
    type?: IndicatorType;
}

export let IndicatorComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-indicator',
        children: [{ tag: 'div', name: 'items', className: 'q-indicator__items' }],
    },
    body: {
        type: 'Indicator',

        _count: 0,
        _activeIndex: -1,
        _type: 'dot' as IndicatorType,
        _itemEls: [] as HTMLElement[],

        _initIndicator(props?: IndicatorProps): void {
            if (props?.type) this._type = props.type;
            if (props?.count) {
                this._count = props.count;
                this._renderItems();
            }
            if (props?.activeIndex !== undefined) {
                this._activeIndex = props.activeIndex;
                this._applyActive();
            }

            this.el.classList.add(`q-indicator--${this._type}`);
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

        get type(): IndicatorType {
            return this._type;
        },
        set type(value: IndicatorType) {
            this.el.classList.remove(`q-indicator--${this._type}`);
            this._type = value;
            this.el.classList.add(`q-indicator--${this._type}`);
            this._renderItems();
        },

        _renderItems(): void {
            const container = this.nodeMap?.items?.el as HTMLElement | null;
            if (!container) return;

            container.innerHTML = '';
            this._itemEls = [];

            for (let i = 0; i < this._count; i++) {
                const itemEl = document.createElement('span');
                itemEl.className = 'q-indicator__item';
                itemEl.dataset.index = String(i);

                if (this._type === 'number') {
                    itemEl.textContent = String(i + 1);
                }

                itemEl.addEventListener('click', () => {
                    this._activeIndex = i;
                    this._applyActive();
                    this.emit('change', { index: i });
                });

                container.appendChild(itemEl);
                this._itemEls.push(itemEl);
            }

            this._applyActive();
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
            if (props?.type !== undefined) this.type = props.type;
            if (props?.count !== undefined) this.count = props.count;
            if (props?.activeIndex !== undefined) this.activeIndex = props.activeIndex;
        },
    },
});

export type IndicatorComponent = InstanceType<typeof IndicatorComponent>;
