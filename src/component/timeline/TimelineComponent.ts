/**
 * TimelineComponent 时间线组件
 *
 * 垂直时间线，支持自定义节点颜色和内容。
 * 数据驱动：通过 items 属性设置时间线项。
 *
 * 模板节点：
 * - items — 时间线项容器
 *
 * @example
 * ```ts
 * new TimelineComponent({
 *     items: [
 *         { title: '创建项目', description: '2024-01-01', color: 'primary' },
 *         { title: '开发中', description: '2024-02-01' },
 *         { title: '发布上线', description: '2024-03-01', color: 'success' },
 *     ],
 * })
 * ```
 */

import { Component } from '@qimenjs/component-core';

export type TimelineColor = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface TimelineItem {
    title: string;
    description?: string;
    timestamp?: string;
    color?: TimelineColor;
    dot?: string;
}

export interface TimelineProps {
    items?: TimelineItem[];
    pending?: boolean;
}

class TimelineComponent extends Component {
    _items: TimelineItem[] = [];
    _pending: boolean = false;
    _itemEls: HTMLElement[] = [];

    onAfterInit(props?: TimelineProps): void {
        this._initTimeline(props);
    }

    _initTimeline(props?: TimelineProps): void {
        if (props?.pending) {
            this._pending = props.pending;
            this.addCls('q-timeline--pending');
        }
        if (props?.items) {
            this._items = props.items;
            this._renderItems();
        }
    }

    get items(): TimelineItem[] {
        return this._items;
    }
    set items(value: TimelineItem[]) {
        this._items = value;
        this._renderItems();
    }

    get pending(): boolean {
        return this._pending;
    }
    set pending(value: boolean) {
        this._pending = value;
        this.toggleCls('q-timeline--pending', value);
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
            li.className = 'q-timeline__item';

            if (item.color && item.color !== 'default') {
                li.classList.add(`q-timeline__item--${item.color}`);
            }

            const tailEl = document.createElement('div');
            tailEl.className = 'q-timeline__tail';
            if (isLast && this._pending) {
                tailEl.classList.add('q-timeline__tail--pending');
            }
            li.appendChild(tailEl);

            const dotEl = document.createElement('div');
            dotEl.className = 'q-timeline__dot';
            if (item.dot) {
                dotEl.textContent = item.dot;
                dotEl.classList.add('q-timeline__dot--custom');
            }
            li.appendChild(dotEl);

            const contentEl = document.createElement('div');
            contentEl.className = 'q-timeline__content';

            const titleEl = document.createElement('div');
            titleEl.className = 'q-timeline__title';
            titleEl.textContent = item.title;
            contentEl.appendChild(titleEl);

            if (item.description) {
                const descEl = document.createElement('div');
                descEl.className = 'q-timeline__description';
                descEl.textContent = item.description;
                contentEl.appendChild(descEl);
            }

            if (item.timestamp) {
                const timeEl = document.createElement('div');
                timeEl.className = 'q-timeline__timestamp';
                timeEl.textContent = item.timestamp;
                contentEl.appendChild(timeEl);
            }

            li.appendChild(contentEl);
            container.appendChild(li);
            this._itemEls.push(li);
        }
    }

    update(props?: Partial<TimelineProps>): void {
        if (props?.items !== undefined) this.items = props.items;
        if (props?.pending !== undefined) this.pending = props.pending;
    }
}

export { TimelineComponent };
export type TimelineComponentInstance = InstanceType<typeof TimelineComponent>;
