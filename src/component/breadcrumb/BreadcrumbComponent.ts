/**
 * BreadcrumbComponent 面包屑导航组件
 *
 * 路径导航，支持分隔符自定义和点击跳转。
 * 数据驱动：通过 items 属性设置面包屑项。
 *
 * 模板节点：
 * - items — 面包屑项容器（纯 DOM，动态创建 li 子项）
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
 * breadcrumb.on('navigate', ({ key }) => { ... })  // 路由系统处理
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { DomEventsMap } from '@qimenjs/component-core';

export interface BreadcrumbItem {
    text: string;
    key: string;
}

export interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    separator?: string;
}

class BreadcrumbComponent extends Component {
    _items: BreadcrumbItem[] = [];
    _separator: string = '/';
    _itemEls: HTMLElement[] = [];
    _pendingNavData: { key: string; index: number } | null = null;

    /**
     * domEvents — 委托模式
     *
     * items 容器内任意 li 点击 → _onItemClick 处理
     * router 分支 → 路由系统监听处理
     */
    domEvents?: DomEventsMap | undefined = {
        click: {
            items: {
                handler: '_onItemClick',
                router: 'navigate',
            },
        },
    };

    onAfterInit(props?: BreadcrumbProps): void {
        this._initBreadcrumb(props);
    }

    _initBreadcrumb(props?: BreadcrumbProps): void {
        if (props?.separator) this._separator = props.separator;
        if (props?.items) {
            this._items = props.items;
            this._renderItems();
        }
    }

    /**
     * 处理 item 点击
     * 从 target DOM 元素向上查找 .q-breadcrumb__item，读取 data-key/data-index
     * 存入 _pendingNavData，供 router 分支收集
     */
    _onItemClick(domEvt: any): void {
        const target = domEvt?.target as HTMLElement | null;
        if (!target) return;

        const itemEl = target.closest('.q-breadcrumb__item') as HTMLElement | null;
        if (!itemEl) return;

        const key = itemEl.dataset.key;
        const index = itemEl.dataset.index;
        if (key !== undefined && index !== undefined) {
            this._pendingNavData = { key, index: Number(index) };
        }
    }

    /**
     * 获取自定义事件数据
     * 读取 _pendingNavData 并清空
     */
    getCustomEventData(): any {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return data ?? {};
    }

    get items(): BreadcrumbItem[] {
        return this._items;
    }
    set items(value: BreadcrumbItem[]) {
        this._items = value;
        this._renderItems();
    }

    get separator(): string {
        return this._separator;
    }
    set separator(value: string) {
        this._separator = value;
        this._renderItems();
    }

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
    }

    update(props?: Partial<BreadcrumbProps>): void {
        if (props?.items !== undefined) this.items = props.items;
        if (props?.separator !== undefined) this.separator = props.separator;
    }
}

export { BreadcrumbComponent };
export type BreadcrumbComponentInstance = InstanceType<typeof BreadcrumbComponent>;
