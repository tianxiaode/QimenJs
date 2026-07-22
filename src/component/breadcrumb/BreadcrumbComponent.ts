/**
 * BreadcrumbComponent 面包屑导航组件
 *
 * 路径导航，支持分隔符自定义和点击跳转。
 * 数据驱动：通过 items 属性设置面包屑项。
 *
 * 模板节点：
 * - items — 面包屑项容器
 *
 * @example
 * ```ts
 * new BreadcrumbComponent({
 *     items: [
 *         { text: '首页', key: 'home' },
 *         { text: '产品', key: 'product' },
 *         { text: '详情', key: 'detail' },
 *     ]
 * })
 * breadcrumb.on('navigate', ({ key }) => { ... })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export interface BreadcrumbItem {
    text: string;
    key: string;
}

export interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    separator?: string;
}

export let BreadcrumbComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'nav',
        cls: 'q-breadcrumb',
        attrs: { 'aria-label': 'Breadcrumb' },
        children: [{ tag: 'ol', name: 'items', cls: 'q-breadcrumb__list' }],
    },
    body: {
        type: 'Breadcrumb',

        onInitState() {
            return {
                _items: [] as BreadcrumbItem[],
                _separator: '/',
                _itemEls: [] as HTMLElement[],
                _clickBound: false,
            };
        },

        onAfterInit(props?: BreadcrumbProps): void {
            this._initBreadcrumb(props);
        },

        _initBreadcrumb(props?: BreadcrumbProps): void {
            if (props?.separator) this._separator = props.separator;
            if (props?.items) {
                this._items = props.items;
                this._renderItems();
            }
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
                const itemEl = target?.closest('.q-breadcrumb__item') as HTMLElement | null;
                const key = itemEl?.dataset?.key;
                const index = itemEl?.dataset?.index;
                if (key !== undefined && index !== undefined) {
                    this.emit('navigate', { key, index: Number(index) });
                }
            });
        },

        get items(): BreadcrumbItem[] {
            return this._items;
        },
        set items(value: BreadcrumbItem[]) {
            this._items = value;
            this._renderItems();
        },

        get separator(): string {
            return this._separator;
        },
        set separator(value: string) {
            this._separator = value;
            this._renderItems();
        },

        _renderItems(): void {
            const container = this.nodeMap?.items?.el as HTMLElement | null;
            if (!container) return;

            container.innerHTML = '';
            this._itemEls = [];

            for (let i = 0; i < this._items.length; i++) {
                const item = this._items[i];
                const isLast = i === this._items.length - 1;

                const li = document.createElement('li');
                li.className = 'q-breadcrumb__item';
                li.dataset.key = item.key;
                li.dataset.index = String(i);

                if (isLast) {
                    li.classList.add('q-breadcrumb__item--active');
                    li.setAttribute('aria-current', 'page');
                }

                const span = document.createElement('span');
                span.className = 'q-breadcrumb__text';
                span.textContent = item.text;
                li.appendChild(span);

                if (!isLast) {
                    const sep = document.createElement('span');
                    sep.className = 'q-breadcrumb__separator';
                    sep.setAttribute('aria-hidden', 'true');
                    sep.textContent = this._separator;
                    li.appendChild(sep);
                }

                container.appendChild(li);
                this._itemEls.push(li);
            }
        },

        update(props?: Partial<BreadcrumbProps>): void {
            if (props?.items !== undefined) this.items = props.items;
            if (props?.separator !== undefined) this.separator = props.separator;
        },
    },
});

export type BreadcrumbComponent = InstanceType<typeof BreadcrumbComponent>;
