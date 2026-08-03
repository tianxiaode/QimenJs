/**
 * DayGridComponent 日期网格组件（池化版）
 *
 * 7列×6行日历网格，含星期标题行。
 * 初始化时创建 7 个 weekday cell + 42 个 day cell，
 * update 时只更新 textContent/classList/dataset，不销毁重建 DOM。
 *
 * 星期标签和 weekStart 从 i18nConfig() 获取，
 * locale 切换时通过 onLocaleChange 自动刷新。
 *
 * 事件：daySelect
 */

import { Component } from '@qimenjs/component-core';
import { DAY_GRID_TPL } from './day-grid-tpl';
import { generateCalendarView, type CalendarDay } from '@/utils/date';
import './date-panel.css';

export interface DayGridProps {
    year: number;
    month: number;
    selectedDay?: number;
    startDayOfWeek?: number;
}

const TOTAL_WEEKDAYS = 7;
const TOTAL_DAY_CELLS = 42;
const DEFAULT_WEEKDAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

class DayGridComponent extends Component {
    _year: number = 2026;
    _month: number = 1;
    _selectedDay: number | undefined = undefined;
    _startDayOfWeek: number = 0;
    _lastClickedDay: number | undefined = undefined;
    _weekdayCells: HTMLElement[] = [];
    _dayCells: HTMLElement[] = [];

    onAfterInit(props?: DayGridProps): void {
        this._year = props?.year ?? 2026;
        this._month = props?.month ?? 1;
        this._selectedDay = props?.selectedDay;
        this._startDayOfWeek = props?.startDayOfWeek ?? this._getWeekStart();
        this._createCells();
        this._applyWeekdays();
        this._applyGrid();
    }

    onLocaleChange(): void {
        const newStart = this._getWeekStart();
        if (newStart !== this._startDayOfWeek) {
            this._startDayOfWeek = newStart;
            this._applyWeekdays();
        }
        this._applyGrid();
    }

    onDayGridClick(e: Event): void {
        const target = e.target as HTMLElement;
        const value = target.dataset.value;
        if (value === undefined) return;
        this._lastClickedDay = parseInt(value);
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { day: this._lastClickedDay };
    }

    _getWeekStart(): number {
        return this.i18nConfig()?.weekStart ?? 0;
    }

    _getWeekdaysShort(): string[] {
        return this.i18nConfig()?.weekdaysShort ?? DEFAULT_WEEKDAYS_SHORT;
    }

    _createCells(): void {
        const row = this._resolveNodeEl('weekdayRow');
        const grid = this._resolveNodeEl('dayGrid');
        if (!row || !grid) return;

        this._weekdayCells = [];
        for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__weekday-cell';
            row.appendChild(cell);
            this._weekdayCells.push(cell);
        }

        this._dayCells = [];
        for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__day-cell';
            grid.appendChild(cell);
            this._dayCells.push(cell);
        }
    }

    _applyWeekdays(): void {
        const labels = this._getWeekdaysShort();
        for (let i = 0; i < TOTAL_WEEKDAYS; i++) {
            const idx = (this._startDayOfWeek + i) % 7;
            this._weekdayCells[i].textContent = labels[idx] ?? '';
        }
    }

    _applyGrid(): void {
        const days: CalendarDay[] = generateCalendarView(
            this._year,
            this._month,
            this._startDayOfWeek
        );

        for (let i = 0; i < TOTAL_DAY_CELLS; i++) {
            const cell = this._dayCells[i];
            const day = days[i];
            if (!day) {
                cell.textContent = '';
                cell.className = 'q-dtpanel__day-cell';
                delete cell.dataset.value;
                continue;
            }

            cell.textContent = String(day.date.getDate());
            cell.className = 'q-dtpanel__day-cell';

            if (!day.isCurrentMonth) {
                cell.classList.add('q-dtpanel__day-cell--other-month');
            } else {
                cell.dataset.value = String(day.date.getDate());
                if (this._selectedDay !== undefined && day.date.getDate() === this._selectedDay) {
                    cell.classList.add('q-dtpanel__day-cell--active');
                }
            }

            if (day.isToday) {
                cell.classList.add('q-dtpanel__day-cell--today');
            }
        }
    }

    update(props?: Partial<DayGridProps>): void {
        let needWeekdayRefresh = false;

        if (props?.startDayOfWeek !== undefined && props.startDayOfWeek !== this._startDayOfWeek) {
            this._startDayOfWeek = props.startDayOfWeek;
            needWeekdayRefresh = true;
        }
        if (props?.year !== undefined) this._year = props.year;
        if (props?.month !== undefined) this._month = props.month;
        if (props?.selectedDay !== undefined) this._selectedDay = props.selectedDay;

        if (needWeekdayRefresh) this._applyWeekdays();
        this._applyGrid();
    }
}

DayGridComponent.useTemplate(DAY_GRID_TPL);
export { DayGridComponent };
export type DayGridComponentInstance = InstanceType<typeof DayGridComponent>;
