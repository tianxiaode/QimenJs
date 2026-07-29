/**
 * StepComponent 步骤条组件
 *
 * 水平/垂直步骤条，支持完成/进行中/等待/错误状态。
 * 数据驱动：通过 items 属性设置步骤项。
 *
 * 模板节点：
 * - items — 步骤项容器
 *
 * @example
 * ```ts
 * new StepComponent({
 *     items: [
 *         { title: '账号', description: '填写账号信息' },
 *         { title: '验证', description: '验证身份' },
 *         { title: '完成', description: '注册完成' },
 *     ],
 *     activeIndex: 1,
 * })
 * step.on('stepClick', ({ index }) => { ... })
 * step.activeIndex = 2;
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepItem {
    title: string;
    description?: string;
    icon?: string;
    status?: StepStatus;
}

export interface StepProps {
    items?: StepItem[];
    activeIndex?: number;
    direction?: 'horizontal' | 'vertical';
}

class StepComponent extends Component {
    _items: StepItem[] = [];
    _activeIndex: number = 0;
    _direction: 'horizontal' | 'vertical' = 'horizontal';
    _itemEls: HTMLElement[] = [];
    _clickBound: boolean = false;

    onAfterInit(props?: StepProps): void {
        this._initStep(props);
    }

    _initStep(props?: StepProps): void {
        if (props?.direction) {
            this._direction = props.direction;
            this.addCls(`q-step--${props.direction}`);
        }
        if (props?.items) {
            this._items = props.items;
            this._renderItems();
        }
        if (props?.activeIndex !== undefined) {
            this._activeIndex = props.activeIndex;
        }
        this._applyStatus();
        this._bindClick();
    }

    _bindClick(): void {
        if (this._clickBound) return;
        const container = this.nodeMap?.items?.el as HTMLElement | null;
        if (!container) return;

        this._clickBound = true;
        this.bind(container, 'click');
        this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
            const target = ctx?.data?.originalEvent?.target as HTMLElement | null;
            const itemEl = target?.closest('.q-step__item') as HTMLElement | null;
            const index = itemEl?.dataset?.index;
            if (index !== undefined) {
                this.emit('stepClick', { index: Number(index) });
            }
        });
    }

    get items(): StepItem[] {
        return this._items;
    }
    set items(value: StepItem[]) {
        this._items = value;
        this._renderItems();
        this._applyStatus();
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    set activeIndex(value: number) {
        this._activeIndex = value;
        this._applyStatus();
    }

    get direction(): 'horizontal' | 'vertical' {
        return this._direction;
    }
    set direction(value: 'horizontal' | 'vertical') {
        this.removeCls(`q-step--${this._direction}`);
        this._direction = value;
        this.addCls(`q-step--${value}`);
    }

    _getItemStatus(index: number): StepStatus {
        const item = this._items[index];
        if (item?.status) return item.status;
        if (index < this._activeIndex) return 'finish';
        if (index === this._activeIndex) return 'process';
        return 'wait';
    }

    _renderItems(): void {
        const container = this.nodeMap?.items?.el as HTMLElement | null;
        if (!container) return;

        container.innerHTML = '';
        this._itemEls = [];

        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            const isLast = i === this._items.length - 1;

            const itemEl = document.createElement('div');
            itemEl.className = 'q-step__item';
            itemEl.dataset.index = String(i);

            const headEl = document.createElement('div');
            headEl.className = 'q-step__head';

            const circleEl = document.createElement('div');
            circleEl.className = 'q-step__circle';
            if (item.icon) {
                circleEl.textContent = item.icon;
            } else {
                const numEl = document.createElement('span');
                numEl.className = 'q-step__number';
                numEl.textContent = String(i + 1);
                circleEl.appendChild(numEl);
            }
            headEl.appendChild(circleEl);

            if (!isLast) {
                const tailEl = document.createElement('div');
                tailEl.className = 'q-step__tail';
                headEl.appendChild(tailEl);
            }

            const bodyEl = document.createElement('div');
            bodyEl.className = 'q-step__body';

            const titleEl = document.createElement('div');
            titleEl.className = 'q-step__title';
            titleEl.textContent = item.title;
            bodyEl.appendChild(titleEl);

            if (item.description) {
                const descEl = document.createElement('div');
                descEl.className = 'q-step__description';
                descEl.textContent = item.description;
                bodyEl.appendChild(descEl);
            }

            itemEl.appendChild(headEl);
            itemEl.appendChild(bodyEl);
            container.appendChild(itemEl);
            this._itemEls.push(itemEl);
        }
    }

    _applyStatus(): void {
        for (let i = 0; i < this._itemEls.length; i++) {
            const itemEl = this._itemEls[i];
            const status = this._getItemStatus(i);

            itemEl.classList.remove(
                'q-step__item--wait',
                'q-step__item--process',
                'q-step__item--finish',
                'q-step__item--error'
            );
            itemEl.classList.add(`q-step__item--${status}`);

            const tailEl = itemEl.querySelector('.q-step__tail');
            if (tailEl) {
                (tailEl as HTMLElement).classList.toggle(
                    'q-step__tail--finish',
                    i < this._activeIndex
                );
            }
        }
    }

    update(props?: Partial<StepProps>): void {
        if (props?.items !== undefined) this.items = props.items;
        if (props?.activeIndex !== undefined) this.activeIndex = props.activeIndex;
        if (props?.direction !== undefined) this.direction = props.direction;
    }
}

export { StepComponent };
export type StepComponentInstance = InstanceType<typeof StepComponent>;
