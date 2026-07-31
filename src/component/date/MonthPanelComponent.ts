/**
 * MonthPanelComponent 月份选择面板（池化版）
 *
 * 6列×2行，直接显示1-12月。点1个数字即选中，触发 autoNext。
 * 初始化时创建 12 个固定 cell，update 时只更新内容和样式。
 * 月份标签从 i18nConfig() 获取 monthsShort，locale 切换自动刷新。
 *
 * 事件：monthSelect / back / prev / confirm
 */

import { Component } from '@qimenjs/component-core';
import { MONTH_PANEL_TPL } from './month-panel-tpl';
import type { DateTimeValue } from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface MonthPanelProps {
    value: DateTimeValue;
    showPrev?: boolean;
}

const TOTAL_MONTHS = 12;

class MonthPanelComponent extends Component {
    _value: DateTimeValue | null = null;
    _cells: HTMLElement[] = [];

    onAfterInit(props?: MonthPanelProps): void {
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

        this._createCells();
        this._applyCells();
    }

    onLocaleChange(): void {
        this._applyCells();
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
        const month = parseInt(value);
        this._value = { ...this._value, month };
        this._applyCells();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    _getMonthsShort(): string[] | undefined {
        return this.i18nConfig()?.monthsShort;
    }

    _createCells(): void {
        const grid = this.nodeMap?.grid?.el as HTMLElement | null;
        if (!grid) return;

        this._cells = [];
        for (let m = 1; m <= TOTAL_MONTHS; m++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.dataset.value = String(m);
            grid.appendChild(cell);
            this._cells.push(cell);
        }
    }

    _applyCells(): void {
        const monthsShort = this._getMonthsShort();

        for (let m = 1; m <= TOTAL_MONTHS; m++) {
            const cell = this._cells[m - 1];
            if (!cell) continue;

            cell.textContent = monthsShort?.[m - 1] ?? String(m).padStart(2, '0');
            cell.className = 'q-dtpanel__cell';
            if (this._value.month === m) {
                cell.classList.add('q-dtpanel__cell--active');
            }
        }
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

MonthPanelComponent.useTemplate(MONTH_PANEL_TPL);
export { MonthPanelComponent };
export type MonthPanelComponentInstance = InstanceType<typeof MonthPanelComponent>;
