import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { BREADCRUMB_TPL } from './breadcrumb-tpl';
import { Definitions } from '@/composable';
import './breadcrumb.css';

export interface BreadcrumbItem {
    text: string;
    key: string;
}

const BreadcrumbComponentDefs: Definitions = {
    options: {
        items: null,
        separator: '/',
    },
} as const;

class BreadcrumbComponent extends Component {
    static type = 'breadcrumb';
    get tpl(): TemplateDecl {
        return BREADCRUMB_TPL;
    }

    _pendingNavData: { key: string; index: number } | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: {
            items: {
                handler: '_onItemClick',
                router: 'navigate',
            },
        },
    };

    _onItemsOptionChange(_value: BreadcrumbItem[]): void {
        this._renderItems();
    }

    _onSeparatorOptionChange(_value: string): void {
        this._renderItems();
    }

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

    getCustomEventData(): any {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return data ?? {};
    }

    private _renderItems(): void {
        const container = this.getNodeEl('items');
        if (!container) return;

        const items = this.getData('items') ?? [];
        const separator = this.getData('separator') ?? '/';

        container.innerHTML = '';

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const isLast = i === items.length - 1;

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
                sep.textContent = separator;
                li.appendChild(sep);
            }

            container.appendChild(li);
        }
    }
}

BreadcrumbComponent.define(BreadcrumbComponentDefs);

export { BreadcrumbComponent };
export type BreadcrumbComponentInstance = InstanceType<typeof BreadcrumbComponent>;
