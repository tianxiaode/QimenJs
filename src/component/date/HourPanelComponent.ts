/**
 * HourPanelComponent 小时选择面板
 *
 * 6列×4行，直接显示0-23。点1个数字即选中，触发 autoNext。
 * 数字格子通过 data-value 标记，grid 容器用 tplEvents 委托 click。
 *
 * 导航栏：← 返回 | ↶ 上一步 | 选择小时 | 确认 ✓
 *
 * 事件：hourSelect / back / prev / confirm
 */

import { Component } from '@qimenjs/component-core';
import type { DateTimeValue } from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface HourPanelProps {
    value: DateTimeValue;
    showPrev?: boolean;
}

class HourPanelComponent extends Component {
    static type = 'HourPanel';

    type = 'HourPanel';

    onInitState() {
        return {
            _value: null as DateTimeValue | null,
        };
    }

    onAfterInit(props?: HourPanelProps): void {
        this._value = props?.value ?? {
            year: 2026,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
        };

        if (!props?.showPrev) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'prevBtn');
        }

        this._renderGrid();
    }

    onBackBtnClick(): void {
        this.emit('back', {});
    }

    onPrevBtnClick(): void {
        this.emit('prev', {});
    }

    onConfirmBtnClick(): void {}

    onGridClick(e: Event): void {
        const target = e.target as HTMLElement;
        const value = target.dataset.value;
        if (value === undefined) return;
        const hour = parseInt(value);
        this._value = { ...this._value, hour };
        this._renderGrid();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    _renderGrid(): void {
        const grid = this.nodeMap?.grid?.el as HTMLElement | null;
        if (!grid) return;
        grid.innerHTML = '';

        for (let h = 0; h <= 23; h++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.textContent = String(h).padStart(2, '0');
            cell.dataset.value = String(h);
            if (this._value.hour === h) {
                cell.classList.add('q-dtpanel__cell--active');
            }
            grid.appendChild(cell);
        }
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

export { HourPanelComponent };
export type HourPanelComponentInstance = InstanceType<typeof HourPanelComponent>;
